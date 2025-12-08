// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./YCToken.sol";

/**
 * @title UniversityCourse
 * @dev 大学课程管理合约，支持课程创建、购买、搜索等功能
 */
contract UniversityCourse is Ownable, ReentrancyGuard {
    YCToken public ycToken;

    struct Course {
        uint256 id;
        string title;
        string description;
        string coverUrl; // Cloudflare R2 URL
        uint256 priceYCT; // 以 YCT 为单位的价格
        address instructor;
        bool isActive;
        uint256 createdAt;
        uint256 totalStudents;
    }

    // 课程 ID => 课程信息
    mapping(uint256 => Course) public courses;

    // 课程 ID => 学生地址 => 是否已购买
    mapping(uint256 => mapping(address => bool)) public hasPurchased;

    // 学生地址 => 已购买的课程 ID 列表
    mapping(address => uint256[]) public studentCourses;

    // 教师地址 => 创建的课程 ID 列表
    mapping(address => uint256[]) public instructorCourses;

    uint256 public courseCounter;
    uint256 public platformFeePercent = 5; // 平台抽成 5%

    event CourseCreated(
        uint256 indexed courseId,
        string title,
        address indexed instructor,
        uint256 priceYCT
    );

    event CoursePurchased(
        uint256 indexed courseId,
        address indexed student,
        uint256 priceYCT,
        uint256 timestamp
    );

    event CourseUpdated(uint256 indexed courseId, string title, uint256 priceYCT);
    event CourseDeactivated(uint256 indexed courseId);

    constructor(address payable _ycTokenAddress) Ownable(msg.sender) {
        ycToken = YCToken(_ycTokenAddress);
    }

    /**
     * @dev 创建新课程
     */
    function createCourse(
        string memory _title,
        string memory _description,
        string memory _coverUrl,
        uint256 _priceYCT
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_priceYCT > 0, "Price must be greater than 0");

        courseCounter++;
        uint256 newCourseId = courseCounter;

        courses[newCourseId] = Course({
            id: newCourseId,
            title: _title,
            description: _description,
            coverUrl: _coverUrl,
            priceYCT: _priceYCT,
            instructor: msg.sender,
            isActive: true,
            createdAt: block.timestamp,
            totalStudents: 0
        });

        instructorCourses[msg.sender].push(newCourseId);

        emit CourseCreated(newCourseId, _title, msg.sender, _priceYCT);

        return newCourseId;
    }

    /**
     * @dev 购买课程（使用 YCT 支付）
     */
    function purchaseCourse(uint256 _courseId) external nonReentrant {
        Course storage course = courses[_courseId];

        require(course.isActive, "Course is not active");
        require(!hasPurchased[_courseId][msg.sender], "Already purchased");
        require(course.instructor != msg.sender, "Instructor cannot buy own course");

        uint256 price = course.priceYCT;

        // 计算平台费用和教师收入
        uint256 platformFee = (price * platformFeePercent) / 100;
        uint256 instructorPayment = price - platformFee;

        // 转账 YCT：学生 -> 教师
        require(
            ycToken.transferFrom(msg.sender, course.instructor, instructorPayment),
            "Payment to instructor failed"
        );

        // 转账平台费用到合约 owner
        require(
            ycToken.transferFrom(msg.sender, owner(), platformFee),
            "Platform fee transfer failed"
        );

        // 记录购买
        hasPurchased[_courseId][msg.sender] = true;
        studentCourses[msg.sender].push(_courseId);
        course.totalStudents++;

        emit CoursePurchased(_courseId, msg.sender, price, block.timestamp);
    }

    /**
     * @dev 更新课程信息（仅教师可操作）
     */
    function updateCourse(
        uint256 _courseId,
        string memory _title,
        string memory _description,
        string memory _coverUrl,
        uint256 _priceYCT
    ) external {
        Course storage course = courses[_courseId];
        require(course.instructor == msg.sender, "Only instructor can update");
        require(course.isActive, "Course is not active");

        course.title = _title;
        course.description = _description;
        course.coverUrl = _coverUrl;
        course.priceYCT = _priceYCT;

        emit CourseUpdated(_courseId, _title, _priceYCT);
    }

    /**
     * @dev 停用课程（仅教师或 owner 可操作）
     */
    function deactivateCourse(uint256 _courseId) external {
        Course storage course = courses[_courseId];
        require(
            course.instructor == msg.sender || msg.sender == owner(),
            "Not authorized"
        );

        course.isActive = false;
        emit CourseDeactivated(_courseId);
    }

    /**
     * @dev 检查用户是否购买了某课程
     */
    function hasUserPurchased(uint256 _courseId, address _user)
        external
        view
        returns (bool)
    {
        return hasPurchased[_courseId][_user];
    }

    /**
     * @dev 获取学生购买的所有课程
     */
    function getStudentCourses(address _student)
        external
        view
        returns (uint256[] memory)
    {
        return studentCourses[_student];
    }

    /**
     * @dev 获取教师创建的所有课程
     */
    function getInstructorCourses(address _instructor)
        external
        view
        returns (uint256[] memory)
    {
        return instructorCourses[_instructor];
    }

    /**
     * @dev 获取课程详细信息
     */
    function getCourse(uint256 _courseId)
        external
        view
        returns (Course memory)
    {
        return courses[_courseId];
    }

    /**
     * @dev 获取所有活跃课程（分页）
     */
    function getActiveCourses(uint256 _offset, uint256 _limit)
        external
        view
        returns (Course[] memory)
    {
        uint256 activeCount = 0;

        // 统计活跃课程数量
        for (uint256 i = 1; i <= courseCounter; i++) {
            if (courses[i].isActive) {
                activeCount++;
            }
        }

        // 计算实际返回数量
        uint256 resultCount = _limit;
        if (_offset >= activeCount) {
            return new Course[](0);
        }
        if (_offset + _limit > activeCount) {
            resultCount = activeCount - _offset;
        }

        Course[] memory activeCourses = new Course[](resultCount);
        uint256 currentIndex = 0;
        uint256 skipped = 0;

        for (uint256 i = 1; i <= courseCounter && currentIndex < resultCount; i++) {
            if (courses[i].isActive) {
                if (skipped >= _offset) {
                    activeCourses[currentIndex] = courses[i];
                    currentIndex++;
                } else {
                    skipped++;
                }
            }
        }

        return activeCourses;
    }

    /**
     * @dev 设置平台抽成比例（仅 owner）
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 20, "Fee cannot exceed 20%");
        platformFeePercent = _feePercent;
    }
}

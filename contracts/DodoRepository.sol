pragma solidity ^0.4.24;

contract DodoRepository {
    address owner;
    Project[] public projects;
    address[] public referees;
    mapping(uint => Proof[]) proofs; // key by project index.

    struct Project {
        string name;
        string description;
        address participant;
        uint startDate;
        uint endDate;
        bool active; //활성화 상태
        bool judged; //심사 상태
        bool success; //성공 상태
        address referee1; 
        address referee2;
        address referee3;
        uint freezeAmount;
    }

    struct Proof {
        string name;
        string description;
        uint timestamp;
        bool judge;
    }

    /**
    * @dev Created a DodoRepository
    */
    constructor() {
        owner = msg.sender;
        Project memory newProject;
        newProject.name = "noname";
        newProject.description = "null";
        newProject.startDate = 0;
        newProject.endDate = 0;
        newProject.active = false;
        newProject.judged = false;
        newProject.success = false;
        newProject.freezeAmount = 0;
        projects.push(newProject);
    }

    /**
    * @dev Get Project Counts
    * @return uint256 represents the number of Projects
    */
    function getProjectCounts() public view returns (uint) {
        return projects.length;
    }

    /**
    * @dev Get My Project Counts
    * @param _address address 
    * @return uint represents the number of my Projects
    */
    function getMyProjectCounts(address _address) public view returns (uint) {
        uint result = 0;
        for (uint i = 0; i < projects.length; i++) {
            if (projects[i].participant == _address) {
                result++;
            }
        }
        return result;
    }

    /**
    * @dev Get My Index
    * @param _address address 
    * @param _index index of 0..<number of my Projects
    * @return uint represents the index of my Projects
    */
    function getMyProjectIndex(address _address, uint _index) public view returns (uint) {
        for (uint i = 0; i < projects.length; i++) {
            if (projects[i].participant == _address) {
                if (_index == 0) {
                    return i;
                }
                _index--;
            }
        }
        return 0;
    }
}

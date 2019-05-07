pragma solidity ^0.4.24;

contract DodoRepository {
    address owner;
    ProjectInfo[] public infos;
    ProjectStatus[] public statuses;
    ProjectReferees[] public referees;
    address[] public refereeEntry;
    mapping(uint => Proof[]) proofs; // key by project index.
    mapping(uint => Proof) claims;
    uint period = 2 days;
    uint nonce = 0;

    struct ProjectInfo {
        string name;
        string description;
        address participant;
        uint startTime;
        uint endTime;
        uint freezeAmount;
    }

    struct ProjectStatus {
        bool active; //활성화 상태
        bool judged; //심사 상태
        bool success; //성공 상태
        uint8 claimed;
    }

    struct ProjectReferees {
        address referee1; 
        address referee2;
        address referee3;
    }

    struct Proof {
        string name;
        string description;
        uint timestamp;
        bool judged;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "This transaction must be called by owner!");
        _;
    }

    modifier onlyReferee(uint _index) {
        require(
            msg.sender == referees[_index].referee1 
            || msg.sender == referees[_index].referee2
            || msg.sender == referees[_index].referee3, 
            "This transaction must be called by project referee!"
        ); 
        _;
    }
    
    modifier onlyProjectOwner(uint _index) {
        require(msg.sender == infos[_index].participant, "This transaction must be called by project owner");
        _;
    }

    /**
    * @dev Created a DodoRepository
    */
    constructor() public {
        owner = msg.sender;
    }

    function () external payable {
        revert();
    }   

    /**
    * @dev Create Project
    * @param _name name of the Project
    * @param _description description of the Project
    * @param _startTime start timestamp
    * @param _endTime end timestamp
    * @return bool result of transaction
    */
    function createProject(string _name,
                            string _description,
                            uint _startTime,
                            uint _endTime) public payable returns (bool) {
        assert(createInfo(_name, _description, _startTime, _endTime)
            && createStatus()
            && createReferees());

        return true;
    }

    /**
    * @dev Finalize Project
    * @param _index Index of the Project 
    * @return bool result of transaction
    */
    function finalizeProject(uint _index) public payable returns (bool) {
        ProjectInfo memory info = infos[_index];
        ProjectStatus memory status = statuses[_index];
        require(now >= info.endTime + period * (status.claimed + 1),
            "This transaction must be fired after claim date finished!");
        status.judged = true;
        if (status.success) {
            info.participant.transfer(info.freezeAmount);
        } else {
            owner.transfer(info.freezeAmount);
        }
        status.active = false;
        return true;
    }

    /**
    * @dev Judge Project
    * @param _index Index of the Project 
    * @param _result judgement result by referee(msg.sender)
    * @return bool result of transaction
    */
    function judgeProject(uint _index, bool _result) public onlyReferee(_index) returns (bool) {
        ProjectStatus memory status = statuses[_index];
        status.judged = true;
        status.success = _result;
        statuses[_index] = status;
        return true;
    }

    /**
    * @dev Submit Proof
    * @param _index Index of the Project 
    * @param name name of the proof
    * @param description description of the proof
    * @return bool result of transaction
    */
    function submitProof(uint _index, string name, string description) public onlyProjectOwner(_index) returns (bool) {
        Proof memory newProof;
        newProof.name = name;
        newProof.description = description;
        newProof.timestamp = now;
        newProof.judged = true;
        proofs[_index].push(newProof);

        return true;
    }

    /**
    * @dev Claim Judge
    * @param _index Index of the Project
    * @param name name of the proof
    * @param description description of the proof 
    * @return bool result of transaction
    */
    function claimJudge(uint _index, string name, string description) public onlyProjectOwner(_index) returns (bool) {
        Proof memory newProof;
        newProof.name = name;
        newProof.description = description;
        newProof.timestamp = now;
        newProof.judged = false;
        claims[_index] = newProof;

        return true;
    }

    /**
    * @dev Claim Approve
    * @param _index Index of the Project 
    * @return bool result of transaction
    */
    function claimApprove(uint _index) public onlyReferee(_index) returns (bool) {
        ProjectStatus memory status = statuses[_index];
        status.judged = true;
        status.success = true;
        statuses[_index] = status;
        return true;
    }

    /**
    * @dev Get Project Counts
    * @return uint256 represents the number of Projects
    */
    function getProjectCounts() public view returns (uint) {
        return infos.length;
    }

    /**
    * @dev Get Project Info by Index
    * @param _index Index of the Project 
    * @return Project represents the Project
    */
    function getProjectInfo(uint _index) public view returns (string,
                                                        string,
                                                        address,
                                                        uint,
                                                        uint,
                                                        uint) {
        ProjectInfo memory project = infos[_index];
        return (
            project.name, project.description, project.participant,
            project.startTime, project.endTime, project.freezeAmount
        );
    }

    /**
    * @dev Get Project Status by Index
    * @param _index Index of the Project 
    * @return Project represents the Project
    */
    function getProjectStatus(uint _index) public view returns (bool, //활성화 상태
                                                        bool, //심사 상태
                                                        bool, //성공 상태
                                                        uint8) {
        ProjectStatus memory project = statuses[_index];
        return (project.active, project.judged, project.success, project.claimed);
    }

    /**
    * @dev Get Project Referees by Index
    * @param _index Index of the Project 
    * @return Project represents the Project
    */
    function getProjectReferees(uint _index) public view returns (address, 
                                                        address,
                                                        address) {
        ProjectReferees memory project = referees[_index];
        return (project.referee1, project.referee2, project.referee3);
    }

    /**
    * @dev Get My Project Counts
    * @param _address address 
    * @return uint represents the number of my Projects
    */
    function getMyProjectCounts(address _address) public view returns (uint) {
        uint result = 0;
        for (uint i = 0; i < infos.length; i++) {
            if (infos[i].participant == _address) {
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
        for (uint i = 0; i < infos.length; i++) {
            if (infos[i].participant == _address) {
                if (_index == 0) {
                    return i;
                }
                _index--;
            }
        }
        return 0;
    }

    function random() internal returns (uint) {
        uint randomnumber = uint(keccak256(abi.encodePacked(now, msg.sender, nonce))) % infos.length;
        nonce++;
        return randomnumber;
    }

    function createInfo(string _name,
                            string _description,
                            uint _startTime,
                            uint _endTime) internal returns (bool) {
        ProjectInfo memory newProject;
        newProject.name = _name;
        newProject.description = _description;
        newProject.startTime = _startTime;
        newProject.endTime = _endTime;
        newProject.participant = msg.sender;
        newProject.freezeAmount = msg.value;
        infos.push(newProject);
        return true;
    }

    function createStatus() internal returns (bool) {
        ProjectStatus memory newProject;
        newProject.active = true;
        newProject.judged = false;
        newProject.success = true;
        newProject.claimed = 0;
        statuses.push(newProject);
        return true;
    }

    function createReferees() internal returns (bool) {
        ProjectReferees memory newProject;
        uint randNum = random();
        newProject.referee1 = refereeEntry[randNum];
        randNum = (randNum + 1) % infos.length;
        newProject.referee2 = refereeEntry[randNum];
        randNum = (randNum + 1) % infos.length;
        newProject.referee3 = refereeEntry[randNum];
        referees.push(newProject);
        return true;
    }
}

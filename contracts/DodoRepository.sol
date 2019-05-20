pragma solidity ^0.4.24;

contract DodoRepository {
    address owner;
    ProjectInfo[] public infos;
    ProjectStatus[] public statuses;
    ProjectReferees[] public referees;

    Proof[] public proofs; 
    mapping(uint => uint[]) ppMap; // key: project index, value: proof indexes
    mapping(uint => Proof) claims; // key: proof index, value: claim

    address[] public whiteList;
    address[] public blackList;
    uint period = 2 minutes;
    uint nonce = 0;

    struct ProjectInfo {
        string name;
        string description;
        address participant;
        uint startDate;
        uint endDate;
        uint freezeAmount;
    }

    struct ProjectStatus {
        bool active; //활성화 상태
        bool success; //성공 상태
    }

    struct ProjectReferees {
        address referee1; 
        address referee2;
        address referee3;
    }

    struct Proof {
        string name;
        string memo;
        uint projectNo;
        uint timestamp;
        uint8 judged; // 0: 클레임, 1: 심사필요, 2,4,8   16,32,64   48이상은 트루 (배심원의 2/3 이상 찬성), 128 클레임 후 찬성
        address[] like;
        address[] dislike;
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
        owner = 0xbf128F013F40ec7Fdfe95d0A298E85764f628e7F;
        whiteList.push(0xbf128F013F40ec7Fdfe95d0A298E85764f628e7F);
    }

    function () external payable {
        revert();
    }   

    /**
    * @dev Create Project
    * @param _name name of the Project
    * @param _description description of the Project
    * @param _startDate start timestamp
    * @param _endDate end timestamp
    * @return bool result of transaction
    */
    function createProject(string _name,
                            string _description,
                            uint _startDate,
                            uint _endDate) public payable returns (bool) {
        assert(createInfo(_name, _description, _startDate, _endDate)
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
        require(now >= info.endDate + period * (status.claimed + 1),
            "This transaction must be fired after claim date finished!");
        status.judged = true;
        status.success = status.success 
            && (ppMap[_index].length * 10 >= (info.endDate - info.startDate) * 8 / 1 minutes);
        status.active = false;
        statuses[_index] = status;
        infos[_index] = info;
        if (status.success) {
            info.participant.transfer(info.freezeAmount);
        } else {
            owner.transfer(info.freezeAmount);
        }
        return true;
    }

    /**
    * @dev Submit Proof
    * @param _index Index of the Proof 
    * @param name name of the proof
    * @param description description of the proof
    * @return bool result of transaction
    */
    function submitProof(uint _index, string name, string memo) public onlyProjectOwner(_index) returns (bool) {
        Proof memory newProof;
        newProof.name = name;
        newProof.memo = memo;
        newProof.timestamp = now;
        newProof.judged = 0;
        newProof.projectNo = _index;
        proofs.push(newProof);

        return true;
    }

    /**
    * @dev Claim Judge
    * @param _index Index of the Project
    * @param name name of the proof
    * @param description description of the proof 
    * @return bool result of transaction
    */
    function claimJudge(uint _index, string name, string memo) public onlyProjectOwner(_index) returns (bool) {
        Proof memory newProof;
        newProof.name = name;
        newProof.memo = memo;
        newProof.timestamp = now;
        newProof.judged = 1;
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
    * @dev Apply Referee
    * @return bool result of transaction
    */
    function applyReferee() public returns (bool) {
        whiteList.push(msg.sender);
        return true;
    }

    /**
    * @dev Cancel Referee
    * @return bool result of transaction
    */
    function cancelReferee() public returns (bool) {
        uint index = whiteList.length;
        for (uint i = 0; i < whiteList.length; i++) {
            if (whiteList[i] == msg.sender) {
                index = i;
                break;
            }
        }
        whiteList[index] = whiteList[whiteList.length - 1];
        whiteList.length--;
        return false;
    }

    /**
    * @dev Get Referee List
    * @return address represents the referee list of Projects
    */
    function getWhiteList() public view returns (address[]) {
        return whiteList;
    }

    function getBlackList() public view returns (address[]) {
        return blackList;
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
    function getProjectInfo(uint _index) public view returns (string name,
                                                        string description,
                                                        address participant,
                                                        uint startDate,
                                                        uint endDate,
                                                        uint freeAmount) {
        ProjectInfo memory project = infos[_index];
        return (
            project.name, project.description, project.participant,
            project.startDate, project.endDate, project.freezeAmount
        );
    }

    /**
    * @dev Get Project Status by Index
    * @param _index Index of the Project 
    * @return Project represents the Project
    */
    function getProjectStatus(uint _index) public view returns (bool active, //활성화 상태
                                                        bool judged, //심사 상태
                                                        bool success, //성공 상태
                                                        uint8 claimed) {
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

    /**
    * @dev Get Proof Count
    * @param _index index of 0..<number of my Projects
    * @return uint represents the count of my Projects Proof
    */
    function getProofsCount(uint _index) public view returns (uint) {
        return proofs[_index].length;
    }

    /**
    * @dev Get Proof
    * @param _projectIdx index of project 
    * @param _proofIdx index of 0..<number of getProofsCount
    * @return proof information
    */
    function getProof(uint _projectIdx, uint _proofIdx) public view returns (string name,
                                                                            string description,
                                                                            uint timestamp) {
        return (
            proofs[_projectIdx][_proofIdx].name,
            proofs[_projectIdx][_proofIdx].description,
            proofs[_projectIdx][_proofIdx].timestamp
        );
    }

    /**
    * @dev Get Claim
    * @param _index project index  
    * @return claim information
    */
    function getClaim(uint _index) public view returns (string name,
                                                        string description,
                                                        uint timestamp,
                                                        bool judged) {
        return (
            claims[_index].name,
            claims[_index].description,
            claims[_index].timestamp,
            claims[_index].judged
        );
    }

    function random() internal returns (uint) {
        uint randomnumber = uint(keccak256(abi.encodePacked(now, msg.sender, nonce))) % infos.length;
        nonce++;
        return randomnumber;
    }

    function createInfo(string _name,
                            string _description,
                            uint _startDate,
                            uint _endDate) internal returns (bool) {
        ProjectInfo memory newProject;
        newProject.name = _name;
        newProject.description = _description;
        newProject.startDate = _startDate;
        newProject.endDate = _endDate;
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
        newProject.referee1 = whiteList[randNum];
        randNum = (randNum + 1) % whiteList.length;
        newProject.referee2 = whiteList[randNum];
        randNum = (randNum + 1) % whiteList.length;
        newProject.referee3 = whiteList[randNum];
        referees.push(newProject);
        return true;
    }
}

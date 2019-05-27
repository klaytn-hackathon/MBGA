pragma solidity ^0.4.24;

contract DodoRepository {
    address owner;
    ProjectInfo[] public infos;
    ProjectStatus[] public statuses;
    ProjectReferees[] public referees;
    mapping(address => uint[]) apMap; // key: participant address, value: project index

    Proof[] public proofs; 
    mapping(uint => uint[]) ppMap; // key: project index, value: proof indexes
    mapping(address => uint[]) rpMap; // key: judge address, value: proof indexes
    mapping(address => uint[]) apfMap; // key: participant address, value: proof index

    mapping(uint => Proof) claims; // key: proof index, value: claim

    address[] public whiteList;
    address[] public blackList; // 아직 기능 구현 안할듯
    uint period = 2 days;
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
        uint8 claimed;
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
        uint8 judged; // 1: 클레임, 0: 심사필요, 2,4,8   16,32,64   48이상은 트루 (배심원의 2/3 이상 찬성), 128 클레임 후 찬성, 129 클레임 실패
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

    modifier onlyProjectOwner2(uint _index) {
        require(msg.sender == infos[proofs[_index].projectNo].participant, 
            "This transaction must be called by project owner");
        _;
    }

    /**
    * @dev Created a DodoRepository
    */
    constructor() public {
        owner = 0xbf128F013F40ec7Fdfe95d0A298E85764f628e7F;
        whiteList.push(0xbf128F013F40ec7Fdfe95d0A298E85764f628e7F);
        whiteList.push(0xd8598Fb4281457f6c3C0E66f1aae1f719d4F0432);
        whiteList.push(0xE64829EBBffA77b5D1b668fbf7e4cFB36Ad33245);
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
        apMap[msg.sender].push(infos.length - 1);
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
        require(status.active == true);
        uint successCount = 0;
        for (uint i = 0; i < ppMap[_index].length; i++) {
            if (calculateProof(ppMap[_index][i])) successCount += 1;
        }
        status.success = successCount * 10 >= (info.endDate - info.startDate) * 8 / 1 days;
        status.active = false;
        statuses[_index] = status;
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
    * @param memo description of the proof
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
        ppMap[_index].push(proofs.length - 1);
        rpMap[referees[_index].referee1].push(proofs.length - 1);
        rpMap[referees[_index].referee2].push(proofs.length - 1);
        rpMap[referees[_index].referee3].push(proofs.length - 1);
        apfMap[msg.sender].push(proofs.length - 1);

        return true;
    }

    /**
    * @dev Claim Judge
    * @param _index Index of the Project
    * @param name name of the proof
    * @param memo description of the proof 
    * @return bool result of transaction
    */
    function claimJudge(uint _index, string name, string memo) public onlyProjectOwner2(_index) returns (bool) {
        Proof memory newProof;
        newProof.name = name;
        newProof.memo = memo;
        newProof.timestamp = now;
        newProof.judged = 1;
        claims[_index] = newProof;
        proofs[_index].judged = 1;
        
        statuses[proofs[_index].projectNo].claimed += 1;

        return true;
    }

    /**
    * @dev Claim Approve
    * @param _index Index of the Project 
    * @return bool result of transaction
    */
    function claimApprove(uint _index) public onlyReferee(_index) returns (bool) {
        proofs[_index].judged = 128;
        claims[_index].judged = 128;
        return true;
    }

    /**
    * @dev Claim Decline
    * @param _index Index of the Project 
    * @return bool result of transaction
    */
    function claimDecline(uint _index) public onlyReferee(_index) returns (bool) {
        proofs[_index].judged = 129;
        claims[_index].judged = 129;
        return true;
    }

    /**
    * @dev Apply Referee
    * @return bool result of transaction
    */
    function applyReferee() public returns (bool) {
        for (uint i = 0; i < whiteList.length; i++) {
            if (whiteList[i] == msg.sender) {
                return false;
            }
        }
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

    function likeProof(uint _index) public returns (bool) {
        require(now < proofs[_index].timestamp + period);
        address[] memory arr = proofs[_index].like;
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == msg.sender) {
                return false;
            }
        }
        address[] memory arr2 = proofs[_index].dislike;
        for (uint j = 0; j < arr2.length; i++) {
            if (arr2[j] == msg.sender) {
                return false;
            }
        }
        proofs[_index].like.push(msg.sender);
        if (msg.sender == referees[proofs[_index].projectNo].referee1) {
            proofs[_index].judged += 16;
        } else if (msg.sender == referees[proofs[_index].projectNo].referee2) {
            proofs[_index].judged += 32;
        } else if (msg.sender == referees[proofs[_index].projectNo].referee3) {
            proofs[_index].judged += 64;
        }

        return true;
    }

    function dislikeProof(uint _index) public returns (bool) {
        require(now < proofs[_index].timestamp + period);
        address[] memory arr = proofs[_index].dislike;
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == msg.sender) {
                return false;
            }
        }
        address[] memory arr2 = proofs[_index].like;
        for (uint j = 0; j < arr2.length; i++) {
            if (arr2[j] == msg.sender) {
                return false;
            }
        }
        proofs[_index].dislike.push(msg.sender);
        if (msg.sender == referees[proofs[_index].projectNo].referee1) {
            proofs[_index].judged += 2;
        } else if (msg.sender == referees[proofs[_index].projectNo].referee2) {
            proofs[_index].judged += 4;
        } else if (msg.sender == referees[proofs[_index].projectNo].referee3) {
            proofs[_index].judged += 8;
        }
        return true;
    }

    /**
    * @dev Get Referee List
    * @return address represents the referee list of Projects
    */
    function getWhiteList() public view returns (address[]) {
        return whiteList;
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
                                                        bool success, //성공 상태
                                                        uint8 claimed) {
        ProjectStatus memory project = statuses[_index];
        return (project.active, project.success, project.claimed);
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
    * @dev Get My Project List
    * @param _address address 
    * @return uint[] represents the number of my Projects
    */
    function getMyProjectList(address _address) public view returns (uint[] list) {
        return apMap[_address];
    }

    /**
    * @dev Get All Proof Count
    * @return uint represents the count of All Project Proofs
    */
    function getAllProofsCount() public view returns (uint) {
        return proofs.length;
    }

    /**
    * @dev Get Proof Count
    * @param _index index of 0..<number of my Projects
    * @return uint represents the count of my Projects Proof
    */
    function getProofsCount(uint _index) public view returns (uint) {
        return ppMap[_index].length;
    }

    /**
    * @dev Get Proof
    * @param _index index of proof 
    * @return proof information
    */
    function getProof(uint _index) public view returns (string name,
        string memo,
        uint projectNo,
        uint timestamp,
        uint8 judged,
        address[] like,
        address[] dislike) {
        return (
            proofs[_index].name,
            proofs[_index].memo,
            proofs[_index].projectNo,
            proofs[_index].timestamp,
            proofs[_index].judged,
            proofs[_index].like,
            proofs[_index].dislike
        );
    }

    function getProofList(uint _index) public view returns (uint[] list) {
        return ppMap[_index];
    }

    function getJudgeList(address _address) public view returns (uint[] list) {
        return rpMap[_address];
    }

    function getParticipantProofList(address _address) public view returns (uint[] list) {
        return apfMap[_address];
    }

    /**
    * @dev Get Claim
    * @param _index proof index  
    * @return claim information
    */
    function getClaim(uint _index) public view returns (string name,
                                                        string memo,
                                                        uint timestamp,
                                                        uint8 judged) {
        Proof memory claim = claims[_index];
        return (
            claim.name,
            claim.memo,
            claim.timestamp,
            claim.judged
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

    function calculateProof(uint _index) internal view returns (bool) {
        uint successCount = 0;
        uint failCount = 0;

        Proof memory proof = proofs[_index];
        if (proof.judged == 129) {
            return false;
        }

        if (proof.judged == 128) {
            return true;
        }

        if (proof.judged / 64 == 1) {
            proof.judged %= 64;
            successCount += 1;
        }
        if (proof.judged / 32 == 1) {
            proof.judged %= 32;
            successCount += 1;
        }
        if (proof.judged / 16 == 1) {
            proof.judged %= 16;
            successCount += 1;
        }
        if (successCount >= 2) return true;

        if (proof.judged / 8 == 1) {
            proof.judged %= 8;
            failCount += 1;
        }
        if (proof.judged / 4 == 1) {
            proof.judged %= 4;
            failCount += 1;
        }
        if (proof.judged / 2 == 1) {
            proof.judged %= 2;
            failCount += 1;
        }
        if (failCount >= 2) return false;

        if (successCount > failCount) {
            return proof.like.length + 10 > proof.dislike.length;
        } else if (failCount > successCount) {
            return proof.like.length > proof.dislike.length;
        } else {
            return proof.like.length + 5 > proof.dislike.length;
        }
    }
}

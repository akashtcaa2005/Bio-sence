
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import FamilyMember from "@/components/health/FamilyMember";
import AddMemberModal from "@/components/health/AddMemberModal";

interface Member {
  id: number;
  name: string;
  age: number;
  relation: string;
  status: "normal" | "caution" | "abnormal";
  heartRate: number;
  bloodSugar: number;
}

const FamilyDashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      age: 42,
      relation: "Wife",
      status: "normal",
      heartRate: 68,
      bloodSugar: 105,
    },
    {
      id: 2,
      name: "Michael Johnson",
      age: 15,
      relation: "Son",
      status: "caution",
      heartRate: 90,
      bloodSugar: 135,
    },
    {
      id: 3,
      name: "Emma Johnson",
      age: 12,
      relation: "Daughter",
      status: "normal",
      heartRate: 76,
      bloodSugar: 110,
    },
    {
      id: 4,
      name: "Robert Johnson",
      age: 70,
      relation: "Father",
      status: "abnormal",
      heartRate: 92,
      bloodSugar: 160,
    },
  ]);

  const handleAddMember = (member: { name: string; age: number; relation: string }) => {
    const newMember: Member = {
      id: members.length + 1,
      name: member.name,
      age: member.age,
      relation: member.relation,
      status: "normal",
      heartRate: Math.floor(Math.random() * (90 - 60 + 1)) + 60,
      bloodSugar: Math.floor(Math.random() * (125 - 80 + 1)) + 80,
    };
    
    setMembers([...members, newMember]);
  };

  const handleMemberClick = (memberId: number) => {
    // In a real app, we would navigate to a specific member view
    // For now, we'll just redirect to the user dashboard
    navigate("/");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Family Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your family members' health
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <AddMemberModal onAddMember={handleAddMember} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <FamilyMember
            key={member.id}
            name={member.name}
            age={member.age}
            status={member.status}
            heartRate={member.heartRate}
            bloodSugar={member.bloodSugar}
            onClick={() => handleMemberClick(member.id)}
          />
        ))}
        
        {members.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No family members added</h3>
            <p className="text-muted-foreground">
              Add family members to monitor their health
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;

import Image from "next/image";
import { memo } from "react";

import type { TeamMember } from "@/types/about";

interface TeamMemberCardProps {
    member: TeamMember;
    animationDelay?: number;
}

const TeamMemberCard = memo(({
    member,
    animationDelay = 0,
}: TeamMemberCardProps) => (
        <div
            className={`animate-slide-up group text-center`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="relative mb-4 mx-auto w-32 h-32">
                <div className="relative rounded-full overflow-hidden shadow-md transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-primary-500/20">
                    <Image
                        src={member.image}
                        alt={member.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        width={128}
                        height={128}
                    />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {member.name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">{member.role}</p>
        </div>
    ));
TeamMemberCard.displayName = "TeamMemberCard";

export default TeamMemberCard;
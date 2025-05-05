
interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export function TeamMember({ name, role, bio, image }: TeamMemberProps) {
  return (
    <div className="bg-white dark:bg-charcoal/20 rounded-lg shadow-md overflow-hidden">
      <div className="aspect-square">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold mb-1 text-charcoal dark:text-white">{name}</h3>
        <p className="text-blue font-medium text-sm mb-4">{role}</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{bio}</p>
      </div>
    </div>
  );
}

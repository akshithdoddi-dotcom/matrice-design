import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";

export function AvatarPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avatar</h1>
        <p className="mt-1 text-sm text-gray-500">
          User profile picture component with image support and fallback initials.
        </p>
      </div>

      {/* With Initials */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">With Initials</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarFallback>MF</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">MF</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">AU</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">JD</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">Image</span>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Avatar>
  <AvatarFallback>MF</AvatarFallback>
</Avatar>

<Avatar>
  <AvatarImage src="..." alt="User" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`}</pre>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sizes</h2>
        <div className="flex flex-wrap gap-4 items-end p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-6 w-6 text-[10px]">
              <AvatarFallback>XS</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">XS</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8 text-xs">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">SM</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">MD (default)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-12 w-12 text-base">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">LG</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 text-lg">
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">XL</span>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Avatar className="h-6 w-6 text-[10px]">...</Avatar>   {/* XS */}
<Avatar className="h-8 w-8 text-xs">...</Avatar>      {/* SM */}
<Avatar>...</Avatar>                                   {/* MD - default */}
<Avatar className="h-12 w-12 text-base">...</Avatar>  {/* LG */}
<Avatar className="h-16 w-16 text-lg">...</Avatar>    {/* XL */}`}</pre>
      </div>

      {/* Avatar group */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Avatar Group</h2>
        <div className="flex flex-wrap gap-6 items-center p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex -space-x-2">
            {["MF", "AU", "JD", "KL"].map((init) => (
              <Avatar key={init} className="border-2 border-white">
                <AvatarFallback>{init}</AvatarFallback>
              </Avatar>
            ))}
            <Avatar className="border-2 border-white bg-gray-100">
              <AvatarFallback className="text-gray-600 text-xs">+5</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="flex -space-x-2">
  {users.map(u => (
    <Avatar key={u} className="border-2 border-white">
      <AvatarFallback>{u}</AvatarFallback>
    </Avatar>
  ))}
</div>`}</pre>
      </div>
    </div>
  );
}

export default AvatarPage;

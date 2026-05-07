import svgPaths from "./svg-gmvy6r65ah";

function SeverityIcon() {
  return (
    <div className="relative shrink-0 size-[12.6px]" data-name="SeverityIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6 12.6">
        <g clipPath="url(#clip0_235_106)" id="SeverityIcon">
          <path d={svgPaths.p161a1380} fill="var(--fill-0, white)" id="Vector" />
          <g id="Group">
            <path d={svgPaths.p39626200} fill="var(--fill-0, #DC2626)" id="Vector_2" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_235_106">
            <rect fill="white" height="12.6" width="12.6" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export default function SeverityBadge() {
  return (
    <div className="bg-[#e7000b] content-stretch flex gap-[4px] items-center justify-center px-[6px] relative rounded-[2px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] size-full" data-name="SeverityBadge">
      <SeverityIcon />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[12px] not-italic relative shrink-0 text-[10px] text-white tracking-[0.5px] uppercase">critical</p>
    </div>
  );
}
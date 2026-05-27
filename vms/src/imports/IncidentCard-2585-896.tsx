import svgPaths from "./svg-ekfeaq6f4k";
import imgImageWithFallback from "figma:asset/b8995e8c29dab21f10470cf15f2a38fe88b0b5fe.png";

function SeverityIcon() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="SeverityIcon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="SeverityIcon">
          <path d={svgPaths.p1b549050} fill="var(--fill-0, white)" id="Vector" />
          <g id="Group">
            <path d={svgPaths.p1519680} fill="var(--fill-0, #DC2626)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-[#e7000b] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <SeverityIcon />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[129.672px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start overflow-clip relative rounded-[inherit] size-full">
        <p className="font-['Inter:Bold',sans-serif] font-bold leading-[13.75px] not-italic relative shrink-0 text-[11px] text-white tracking-[0.55px] uppercase whitespace-nowrap">Fighting Detection</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[43.203px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[13.5px] left-0 text-[9px] text-white top-0 whitespace-nowrap">17:35 PM</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[129.672px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
        <Text1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] h-[27.25px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Text />
        <Container4 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[27.25px] relative shrink-0 w-[165.672px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Container2 />
        <Container3 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[15px] relative shrink-0 w-[20px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[15px] left-[8px] text-[10px] text-white top-0 whitespace-nowrap">#2</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[#e7000b] content-stretch flex h-[48px] items-center justify-between left-0 pb-px px-[12px] top-0 w-[250px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,119,91,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <Container1 />
      <Container5 />
    </div>
  );
}

function ImageWithFallback() {
  return (
    <div className="absolute h-[159px] left-0 top-0 w-[250px]" data-name="ImageWithFallback">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageWithFallback} />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] h-[23px] left-[8px] rounded-[2px] top-[8px] w-[62.586px]" data-name="Container">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-[8px] not-italic text-[10px] text-white top-[4.5px] whitespace-nowrap">Cam-E04</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] h-[23px] left-[155.8px] rounded-[2px] top-[8px] w-[86.203px]" data-name="Container">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-[8px] not-italic text-[10px] text-white top-[4.5px] whitespace-nowrap">Main Entrance</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-[#f1f5f9] border-[#e2e8f0] border-b border-solid h-[160px] left-0 overflow-clip top-[48px] w-[250px]" data-name="Container">
      <ImageWithFallback />
      <Container7 />
      <Container8 />
    </div>
  );
}

export default function IncidentCard() {
  return (
    <div className="bg-[#fafafa] border border-[#e2e8f0] border-solid overflow-clip relative rounded-[4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] size-full" data-name="IncidentCard">
      <Container />
      <Container6 />
    </div>
  );
}
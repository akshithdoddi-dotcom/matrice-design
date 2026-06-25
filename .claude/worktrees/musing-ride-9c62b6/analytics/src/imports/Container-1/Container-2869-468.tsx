import svgPaths from "./svg-9j0rmae98c";

function Container1() {
  return (
    <div className="h-[22px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <p className="font-['Inter:Bold',sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[12px] text-white tracking-[0.5px] uppercase whitespace-nowrap">Mean time to acknowledge</p>
      </div>
    </div>
  );
}

function P() {
  return (
    <div className="h-[16px] relative shrink-0 w-[54.891px]" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-0 not-italic text-[#e7000b] text-[10px] top-0 tracking-[0.225px] uppercase whitespace-nowrap">approaching sla</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[48px] relative shrink-0 w-[34.5px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[32px] relative shrink-0 text-[30px] text-white tracking-[-0.75px] whitespace-nowrap">02</p>
        <P />
      </div>
    </div>
  );
}

function P1() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[18px] left-0 text-[#00a63e] text-[18px] top-0 whitespace-nowrap">-1%</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p3c08db00} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p331ef140} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[18px] relative shrink-0 w-[52.406px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <P1 />
        <Icon />
      </div>
    </div>
  );
}

function P2() {
  return (
    <div className="h-[14.398px] opacity-80 relative shrink-0 w-[67.109px]" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[14.4px] left-0 not-italic text-[#00a63e] text-[9px] top-[0.5px] uppercase whitespace-nowrap">VS LAST WEEK</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#e5ffef] h-[44.398px] relative rounded-[4px] shrink-0 w-[85.109px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(185,248,207,0.5)] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-end justify-center pl-px pr-[9px] py-px relative size-full">
        <Container5 />
        <P2 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#021d18] content-stretch flex flex-col gap-[16px] items-start p-[12px] relative size-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}
import svgPaths from "./svg-irm3yhn5l1";

function Heading() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[16px] left-0 not-italic text-[#334155] text-[11px] top-[0.5px] tracking-[0.7px] uppercase whitespace-nowrap">Severity Distribution</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="-translate-y-1/2 absolute font-bold h-[55.5px] left-[43.38px] top-[calc(50%-0.25px)] w-[97px] whitespace-nowrap">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] leading-[40px] left-[16.22px] text-[#0f172a] text-[36px] top-0">142</p>
      <p className="absolute font-['Inter:Bold',sans-serif] leading-[15px] left-0 not-italic text-[#94a3b8] text-[10px] top-[40.5px] tracking-[0.5px] uppercase">Total Incidents</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute bottom-1/2 left-[78.5%] right-[1.09%] top-[26.23%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37.5586 43.7296">
        <g id="Group">
          <path d={svgPaths.p34fa1300} fill="var(--fill-0, #E7000B)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[1.09%_9.01%_67.79%_40.75%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 92.4408 57.2599">
        <g id="Group">
          <path d={svgPaths.p661d780} fill="var(--fill-0, #EA580C)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[2.73%_58.39%_22.71%_1.09%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 74.5706 137.191">
        <g id="Group">
          <path d={svgPaths.p138475f0} fill="var(--fill-0, #E19A04)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[52.28%_1.21%_1.09%_11.41%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160.783 85.8146">
        <g id="Group">
          <path d={svgPaths.p337c8f72} fill="var(--fill-0, #2B7FFF)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[1.09%]" data-name="Group">
      <Group1 />
      <Group2 />
      <Group3 />
      <Group4 />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 size-[184px]" data-name="Container">
      <Frame />
      <Group />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-between p-[24px] relative rounded-[10px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Heading />
      <Container1 />
    </div>
  );
}
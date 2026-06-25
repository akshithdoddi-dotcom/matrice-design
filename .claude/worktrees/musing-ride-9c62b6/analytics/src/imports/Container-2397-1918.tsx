import svgPaths from "./svg-a3visj7v15";

function H() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Restricted Zone C</p>
    </div>
  );
}

function P() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Intrusion Detection</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H />
        <P />
      </div>
    </div>
  );
}

function Shield() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Shield">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Shield">
          <path d={svgPaths.pb794cb2} id="Vector" stroke="var(--stroke-0, #E7000B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container1 />
      <Shield />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[146px] text-[#e7000b] text-[20px] text-center top-[-0.5px]">2</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-[145.77px] not-italic text-[#64748b] text-[8px] text-center top-0 tracking-[0.2px] uppercase">Detected Objects</p>
    </div>
  );
}

function Div1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[40px] items-start left-[13px] top-[48px] w-[292px]" data-name="div">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Span() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[70.203px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[13.5px] left-0 text-[#94a3b8] text-[9px] top-0">Time in Area:</p>
      </div>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[32.406px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[13.5px] left-0 text-[#ff6467] text-[9px] top-0">2m ago</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Span />
      <Span1 />
    </div>
  );
}

function Span2() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[81px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[13.5px] left-0 text-[#94a3b8] text-[9px] top-0">Last Detection:</p>
      </div>
    </div>
  );
}

function Span3() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[32.406px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[13.5px] left-0 text-[9px] text-white top-0">2m ago</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Span2 />
      <Span3 />
    </div>
  );
}

function Div2() {
  return (
    <div className="absolute bg-[#0f172a] content-stretch flex flex-col gap-[4px] h-[47px] items-start left-[13px] pt-[8px] px-[8px] rounded-[4px] top-[96px] w-[292px]" data-name="div">
      <Container4 />
      <Container5 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#e7000b] flex-[1_0_0] h-[20px] min-h-px min-w-px relative rounded-[4px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[12px] left-[71.06px] not-italic text-[8px] text-center text-white top-[4px] uppercase">Verify</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#e2e8f0] flex-[1_0_0] h-[20px] min-h-px min-w-px relative rounded-[4px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[12px] left-[70.56px] not-italic text-[#334155] text-[8px] text-center top-[4px] uppercase">Flag</p>
      </div>
    </div>
  );
}

function Div3() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[20px] items-center left-[13px] top-[151px] w-[292px]" data-name="div">
      <Button />
      <Button1 />
    </div>
  );
}

function Div4() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-RC03</p>
    </div>
  );
}

function Div5() {
  return <div className="absolute bg-[#e7000b] left-[309.89px] opacity-78 rounded-[16777200px] size-[12.208px] top-[-4.11px]" data-name="div" />;
}

function MotionDiv() {
  return (
    <div className="bg-[#ffe5e7] col-1 justify-self-stretch opacity-50 relative rounded-[4px] row-1 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e7000b] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_0px_15px_0px_rgba(231,0,11,0.5)]" />
      <Div />
      <Div1 />
      <Div2 />
      <Div3 />
      <Div4 />
      <Div5 />
    </div>
  );
}

function H1() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Back Alley</p>
    </div>
  );
}

function P1() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Loitering Detection</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H1 />
        <P1 />
      </div>
    </div>
  );
}

function BarChart() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="BarChart3">
          <path d={svgPaths.p90824c0} id="Vector" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M12 11.3333V6" id="Vector_2" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8.66797 11.332V3.33203" id="Vector_3" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33203 11.332V9.33203" id="Vector_4" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div6() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container6 />
      <BarChart />
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px] tracking-[0.225px] uppercase">Utilization</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-0 text-[#00775b] text-[20px] top-[-0.5px]">40%</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[57.906px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container9 />
        <Container10 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-[84.27px] not-italic text-[#64748b] text-[9px] text-right top-[0.5px] tracking-[0.225px] uppercase">Avg Dwell</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[84px] text-[#1e293b] text-[20px] text-right top-[-0.5px]">18m 45s</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[84px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container12 />
        <Container13 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex h-[41.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Container11 />
    </div>
  );
}

function Div7() {
  return (
    <div className="absolute content-stretch flex flex-col h-[50.5px] items-start left-[13px] pb-px top-[48px] w-[292px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container7 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[13.5px] left-0 top-0 w-[292px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">Zone Density Map (4x8 Grid Sections)</p>
    </div>
  );
}

function Container16() {
  return <div className="bg-[#ea580c] col-1 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container17() {
  return <div className="bg-[#e7000b] col-2 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container18() {
  return <div className="bg-[#e7000b] col-3 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container19() {
  return <div className="bg-[#ea580c] col-4 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container20() {
  return <div className="bg-[#e7000b] col-5 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container21() {
  return <div className="bg-[#ea580c] col-6 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container22() {
  return <div className="bg-[#e7000b] col-7 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container23() {
  return <div className="bg-[#00a63e] col-8 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container24() {
  return <div className="bg-[#00a63e] col-1 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container25() {
  return <div className="bg-[#f0f2f4] col-2 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container26() {
  return <div className="bg-[#e19a04] col-3 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container27() {
  return <div className="bg-[#e7000b] col-4 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container28() {
  return <div className="bg-[#e19a04] col-5 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container29() {
  return <div className="bg-[#ea580c] col-6 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container30() {
  return <div className="bg-[#ea580c] col-7 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container31() {
  return <div className="bg-[#e19a04] col-8 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container32() {
  return <div className="bg-[#00a63e] col-1 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container33() {
  return <div className="bg-[#e19a04] col-2 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container34() {
  return <div className="bg-[#ea580c] col-3 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container35() {
  return <div className="bg-[#ea580c] col-4 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container36() {
  return <div className="bg-[#e7000b] col-5 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container37() {
  return <div className="bg-[#00a63e] col-6 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container38() {
  return <div className="bg-[#e19a04] col-7 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container39() {
  return <div className="bg-[#ea580c] col-8 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container40() {
  return <div className="bg-[#00a63e] col-1 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container41() {
  return <div className="bg-[#ea580c] col-2 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container42() {
  return <div className="bg-[#ea580c] col-3 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container43() {
  return <div className="bg-[#f0f2f4] col-4 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container44() {
  return <div className="bg-[#00a63e] col-5 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container45() {
  return <div className="bg-[#e7000b] col-6 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container46() {
  return <div className="bg-[#e7000b] col-7 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container47() {
  return <div className="bg-[#e7000b] col-8 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container15() {
  return (
    <div className="absolute gap-x-[2px] gap-y-[2px] grid grid-cols-[repeat(8,minmax(0,1fr))] grid-rows-[repeat(4,minmax(0,1fr))] h-[54px] left-0 top-[19.5px] w-[292px]" data-name="Container">
      <Container16 />
      <Container17 />
      <Container18 />
      <Container19 />
      <Container20 />
      <Container21 />
      <Container22 />
      <Container23 />
      <Container24 />
      <Container25 />
      <Container26 />
      <Container27 />
      <Container28 />
      <Container29 />
      <Container30 />
      <Container31 />
      <Container32 />
      <Container33 />
      <Container34 />
      <Container35 />
      <Container36 />
      <Container37 />
      <Container38 />
      <Container39 />
      <Container40 />
      <Container41 />
      <Container42 />
      <Container43 />
      <Container44 />
      <Container45 />
      <Container46 />
      <Container47 />
    </div>
  );
}

function Span4() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[13.758px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">Low</p>
      </div>
    </div>
  );
}

function Span5() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[87.078px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">Each block = zone section</p>
      </div>
    </div>
  );
}

function Span6() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[15.336px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">High</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute content-stretch flex h-[10.5px] items-start justify-between left-0 top-[77.5px] w-[292px]" data-name="Container">
      <Span4 />
      <Span5 />
      <Span6 />
    </div>
  );
}

function Div8() {
  return (
    <div className="absolute h-[88px] left-[13px] top-[106.5px] w-[292px]" data-name="div">
      <Container14 />
      <Container15 />
      <Container48 />
    </div>
  );
}

function Div9() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-BA01</p>
    </div>
  );
}

function MotionDiv1() {
  return (
    <div className="bg-white col-2 justify-self-stretch relative rounded-[4px] row-1 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div6 />
      <Div7 />
      <Div8 />
      <Div9 />
    </div>
  );
}

function H2() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Perimeter North</p>
    </div>
  );
}

function P2() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Wrong-way Detection</p>
    </div>
  );
}

function Container49() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H2 />
        <P2 />
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowRight">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowRight">
          <path d="M3.33203 8H12.6654" id="Vector" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p287e9400} id="Vector_2" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div10() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container49 />
      <ArrowRight />
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex h-[32px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[32px] min-h-px min-w-px relative text-[#ea580c] text-[24px] text-center whitespace-pre-wrap">11</p>
    </div>
  );
}

function Container51() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-[145.8px] not-italic text-[#64748b] text-[8px] text-center top-0 tracking-[0.2px] uppercase">Wrong-Way Violations (Last Hour)</p>
    </div>
  );
}

function Div11() {
  return (
    <div className="absolute content-stretch flex flex-col h-[53px] items-start left-[13px] pb-px top-[48px] w-[292px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container50 />
      <Container51 />
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">Violation Intensity</p>
    </div>
  );
}

function Container55() {
  return (
    <div className="bg-[#ea580c] content-stretch flex h-[24px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[15px] relative shrink-0 text-[10px] text-white">11</p>
    </div>
  );
}

function Container54() {
  return (
    <div className="bg-[#f1f5f9] flex-[1_0_0] h-[24px] min-h-px min-w-px relative rounded-[4px]" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pr-[69.977px] relative size-full">
          <Container55 />
        </div>
      </div>
    </div>
  );
}

function Span7() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[21.602px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[13.5px] left-0 text-[#94a3b8] text-[9px] top-0">/ 15</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center relative shrink-0 w-full" data-name="Container">
      <Container54 />
      <Span7 />
    </div>
  );
}

function Div12() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[41.5px] items-start left-[13px] top-[109px] w-[292px]" data-name="div">
      <Container52 />
      <Container53 />
    </div>
  );
}

function Container57() {
  return <div className="bg-[#00775b] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Span8() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[10.328px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">In:</p>
      </div>
    </div>
  );
}

function Span9() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[16.211px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[13.5px] left-0 text-[#0f172a] text-[9px] top-0">85%</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="flex-[1_0_0] h-[13.5px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Container57 />
        <Span8 />
        <Span9 />
      </div>
    </div>
  );
}

function ArrowRight1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="ArrowRight">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="ArrowRight">
          <path d="M2.5 6H9.5" id="Vector" stroke="var(--stroke-0, #94A3B8)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 2.5L9.5 6L6 9.5" id="Vector_2" stroke="var(--stroke-0, #94A3B8)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Span10() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[16.211px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[13.5px] left-0 text-[#0f172a] text-[9px] top-0">15%</p>
      </div>
    </div>
  );
}

function Span11() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[17.742px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">:Out</p>
      </div>
    </div>
  );
}

function Container59() {
  return <div className="bg-[#94a3b8] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container58() {
  return (
    <div className="flex-[1_0_0] h-[13.5px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center justify-end relative size-full">
        <Span10 />
        <Span11 />
        <Container59 />
      </div>
    </div>
  );
}

function Div13() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[13.5px] items-center left-[13px] top-[158.5px] w-[292px]" data-name="div">
      <Container56 />
      <ArrowRight1 />
      <Container58 />
    </div>
  );
}

function Div14() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-PN01</p>
    </div>
  );
}

function MotionDiv2() {
  return (
    <div className="bg-[#feefe7] col-3 justify-self-stretch relative rounded-[4px] row-1 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#ea580c] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div10 />
      <Div11 />
      <Div12 />
      <Div13 />
      <Div14 />
    </div>
  );
}

function H3() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Parking Lot A (North)</p>
    </div>
  );
}

function P3() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Parking Analytics</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H3 />
        <P3 />
      </div>
    </div>
  );
}

function Activity() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Activity">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2397_1928)" id="Activity">
          <path d={svgPaths.p3468a000} id="Vector" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_2397_1928">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div15() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container60 />
      <Activity />
    </div>
  );
}

function Span12() {
  return (
    <div className="absolute content-stretch flex h-[32px] items-start left-[122.19px] top-0 w-[14.406px]" data-name="span">
      <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[32px] relative shrink-0 text-[#1e293b] text-[24px] text-center">8</p>
    </div>
  );
}

function Span13() {
  return (
    <div className="absolute h-[20px] left-[140.59px] top-[9.5px] w-[8.406px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[20px] left-[4.5px] text-[#94a3b8] text-[14px] text-center top-[-0.5px]">/</p>
    </div>
  );
}

function Span14() {
  return (
    <div className="absolute h-[20px] left-[153px] top-[9.5px] w-[16.805px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[20px] left-[8.5px] text-[#64748b] text-[14px] text-center top-[-0.5px]">10</p>
    </div>
  );
}

function Container61() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <Span12 />
      <Span13 />
      <Span14 />
    </div>
  );
}

function Container62() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-[146.44px] not-italic text-[#64748b] text-[8px] text-center top-0 tracking-[0.2px] uppercase">Spots Occupied (88%)</p>
    </div>
  );
}

function Div16() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[2px] h-[55px] items-start left-[13px] pb-px top-[48px] w-[292px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container61 />
      <Container62 />
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute h-[13.5px] left-0 top-0 w-[292px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">Visual Spot Status</p>
    </div>
  );
}

function Container65() {
  return <div className="absolute bg-[#00775b] h-[20px] left-0 rounded-[4px] top-0 w-[55.195px]" data-name="Container" />;
}

function Container66() {
  return <div className="absolute bg-[#00775b] h-[20px] left-[59.2px] rounded-[4px] top-0 w-[55.203px]" data-name="Container" />;
}

function Container67() {
  return <div className="absolute bg-[#00775b] h-[20px] left-[118.4px] rounded-[4px] top-0 w-[55.195px]" data-name="Container" />;
}

function Container68() {
  return <div className="absolute bg-[#00775b] h-[20px] left-[177.59px] rounded-[4px] top-0 w-[55.203px]" data-name="Container" />;
}

function Container69() {
  return <div className="absolute bg-[#00775b] h-[20px] left-[236.8px] rounded-[4px] top-0 w-[55.203px]" data-name="Container" />;
}

function Container70() {
  return <div className="absolute bg-[#00775b] h-[20px] left-0 rounded-[4px] top-[24px] w-[55.195px]" data-name="Container" />;
}

function Container71() {
  return <div className="absolute bg-[#00775b] h-[20px] left-[59.2px] rounded-[4px] top-[24px] w-[55.203px]" data-name="Container" />;
}

function Container72() {
  return <div className="absolute bg-[#00775b] h-[20px] left-[118.4px] rounded-[4px] top-[24px] w-[55.195px]" data-name="Container" />;
}

function Container73() {
  return <div className="absolute bg-[#00775b] h-[20px] left-[177.59px] rounded-[4px] top-[24px] w-[55.203px]" data-name="Container" />;
}

function Container74() {
  return <div className="absolute bg-[#e2e8f0] h-[20px] left-[236.8px] rounded-[4px] top-[24px] w-[55.203px]" data-name="Container" />;
}

function Container64() {
  return (
    <div className="absolute h-[44px] left-0 top-[19.5px] w-[292px]" data-name="Container">
      <Container65 />
      <Container66 />
      <Container67 />
      <Container68 />
      <Container69 />
      <Container70 />
      <Container71 />
      <Container72 />
      <Container73 />
      <Container74 />
    </div>
  );
}

function Span15() {
  return (
    <div className="h-[12px] relative shrink-0 w-[29.609px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#94a3b8] text-[8px] top-0">Filled: 8</p>
      </div>
    </div>
  );
}

function Span16() {
  return (
    <div className="h-[12px] relative shrink-0 w-[43.234px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#94a3b8] text-[8px] top-0">Available: 2</p>
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start justify-between left-0 top-[67.5px] w-[292px]" data-name="Container">
      <Span15 />
      <Span16 />
    </div>
  );
}

function Div17() {
  return (
    <div className="absolute h-[79.5px] left-[13px] top-[111px] w-[292px]" data-name="div">
      <Container63 />
      <Container64 />
      <Container75 />
    </div>
  );
}

function Div18() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-PA01</p>
    </div>
  );
}

function MotionDiv3() {
  return (
    <div className="bg-white col-4 justify-self-stretch relative rounded-[4px] row-1 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div15 />
      <Div16 />
      <Div17 />
      <Div18 />
    </div>
  );
}

function H4() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Server Room Entrance</p>
    </div>
  );
}

function P4() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Intrusion Detection</p>
    </div>
  );
}

function Container76() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H4 />
        <P4 />
      </div>
    </div>
  );
}

function Shield1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Shield">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Shield">
          <path d={svgPaths.pb794cb2} id="Vector" stroke="var(--stroke-0, #94A3B8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div19() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container76 />
      <Shield1 />
    </div>
  );
}

function Container77() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[146px] text-[#1e293b] text-[20px] text-center top-[-0.5px]">0</p>
    </div>
  );
}

function Container78() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-[145.77px] not-italic text-[#64748b] text-[8px] text-center top-0 tracking-[0.2px] uppercase">Detected Objects</p>
    </div>
  );
}

function Div20() {
  return (
    <div className="absolute content-stretch flex flex-col h-[40px] items-start left-[13px] top-[48px] w-[292px]" data-name="div">
      <Container77 />
      <Container78 />
    </div>
  );
}

function Span17() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[70.203px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[13.5px] left-0 text-[#94a3b8] text-[9px] top-0">Time in Area:</p>
      </div>
    </div>
  );
}

function Span18() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[32.406px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[13.5px] left-0 text-[#00956d] text-[9px] top-0">2h ago</p>
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Span17 />
      <Span18 />
    </div>
  );
}

function Span19() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[81px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[13.5px] left-0 text-[#94a3b8] text-[9px] top-0">Last Detection:</p>
      </div>
    </div>
  );
}

function Span20() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[32.406px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[13.5px] left-0 text-[9px] text-white top-0">2h ago</p>
      </div>
    </div>
  );
}

function Container80() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Span19 />
      <Span20 />
    </div>
  );
}

function Div21() {
  return (
    <div className="absolute bg-[#0f172a] content-stretch flex flex-col gap-[4px] h-[47px] items-start left-[13px] pt-[8px] px-[8px] rounded-[4px] top-[96px] w-[292px]" data-name="div">
      <Container79 />
      <Container80 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#e7000b] flex-[1_0_0] h-[20px] min-h-px min-w-px relative rounded-[4px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[12px] left-[71.06px] not-italic text-[8px] text-center text-white top-[4px] uppercase">Verify</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#e2e8f0] flex-[1_0_0] h-[20px] min-h-px min-w-px relative rounded-[4px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[12px] left-[70.56px] not-italic text-[#334155] text-[8px] text-center top-[4px] uppercase">Flag</p>
      </div>
    </div>
  );
}

function Div22() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[20px] items-center left-[13px] top-[151px] w-[292px]" data-name="div">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Div23() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-SR01</p>
    </div>
  );
}

function MotionDiv4() {
  return (
    <div className="bg-white col-1 justify-self-stretch relative rounded-[4px] row-2 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div19 />
      <Div20 />
      <Div21 />
      <Div22 />
      <Div23 />
    </div>
  );
}

function H5() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Loading Dock</p>
    </div>
  );
}

function P5() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Area Utilisation</p>
    </div>
  );
}

function Container81() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H5 />
        <P5 />
      </div>
    </div>
  );
}

function BarChart1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="BarChart3">
          <path d={svgPaths.p90824c0} id="Vector" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M12 11.3333V6" id="Vector_2" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8.66797 11.332V3.33203" id="Vector_3" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33203 11.332V9.33203" id="Vector_4" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div24() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container81 />
      <BarChart1 />
    </div>
  );
}

function Container84() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px] tracking-[0.225px] uppercase">Utilization</p>
    </div>
  );
}

function Container85() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-0 text-[#00775b] text-[20px] top-[-0.5px]">75%</p>
    </div>
  );
}

function Container83() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[57.906px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container84 />
        <Container85 />
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-[84.27px] not-italic text-[#64748b] text-[9px] text-right top-[0.5px] tracking-[0.225px] uppercase">Avg Dwell</p>
    </div>
  );
}

function Container88() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[84px] text-[#1e293b] text-[20px] text-right top-[-0.5px]">22m 18s</p>
    </div>
  );
}

function Container86() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[84px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container87 />
        <Container88 />
      </div>
    </div>
  );
}

function Container82() {
  return (
    <div className="content-stretch flex h-[41.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container83 />
      <Container86 />
    </div>
  );
}

function Div25() {
  return (
    <div className="absolute content-stretch flex flex-col h-[50.5px] items-start left-[13px] pb-px top-[48px] w-[292px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container82 />
    </div>
  );
}

function Container89() {
  return (
    <div className="absolute h-[13.5px] left-0 top-0 w-[292px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">Zone Density Map (4x8 Grid Sections)</p>
    </div>
  );
}

function Container91() {
  return <div className="bg-[#e7000b] col-1 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container92() {
  return <div className="bg-[#00a63e] col-2 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container93() {
  return <div className="bg-[#e7000b] col-3 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container94() {
  return <div className="bg-[#00a63e] col-4 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container95() {
  return <div className="bg-[#ea580c] col-5 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container96() {
  return <div className="bg-[#ea580c] col-6 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container97() {
  return <div className="bg-[#ea580c] col-7 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container98() {
  return <div className="bg-[#e7000b] col-8 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container99() {
  return <div className="bg-[#e7000b] col-1 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container100() {
  return <div className="bg-[#ea580c] col-2 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container101() {
  return <div className="bg-[#00a63e] col-3 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container102() {
  return <div className="bg-[#f0f2f4] col-4 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container103() {
  return <div className="bg-[#e7000b] col-5 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container104() {
  return <div className="bg-[#ea580c] col-6 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container105() {
  return <div className="bg-[#00a63e] col-7 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container106() {
  return <div className="bg-[#e7000b] col-8 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container107() {
  return <div className="bg-[#e7000b] col-1 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container108() {
  return <div className="bg-[#f0f2f4] col-2 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container109() {
  return <div className="bg-[#e19a04] col-3 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container110() {
  return <div className="bg-[#00a63e] col-4 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container111() {
  return <div className="bg-[#00a63e] col-5 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container112() {
  return <div className="bg-[#f0f2f4] col-6 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container113() {
  return <div className="bg-[#e19a04] col-7 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container114() {
  return <div className="bg-[#ea580c] col-8 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container115() {
  return <div className="bg-[#e19a04] col-1 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container116() {
  return <div className="bg-[#e19a04] col-2 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container117() {
  return <div className="bg-[#00a63e] col-3 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container118() {
  return <div className="bg-[#ea580c] col-4 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container119() {
  return <div className="bg-[#e19a04] col-5 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container120() {
  return <div className="bg-[#ea580c] col-6 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container121() {
  return <div className="bg-[#f0f2f4] col-7 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container122() {
  return <div className="bg-[#e19a04] col-8 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container90() {
  return (
    <div className="absolute gap-x-[2px] gap-y-[2px] grid grid-cols-[repeat(8,minmax(0,1fr))] grid-rows-[repeat(4,minmax(0,1fr))] h-[54px] left-0 top-[19.5px] w-[292px]" data-name="Container">
      <Container91 />
      <Container92 />
      <Container93 />
      <Container94 />
      <Container95 />
      <Container96 />
      <Container97 />
      <Container98 />
      <Container99 />
      <Container100 />
      <Container101 />
      <Container102 />
      <Container103 />
      <Container104 />
      <Container105 />
      <Container106 />
      <Container107 />
      <Container108 />
      <Container109 />
      <Container110 />
      <Container111 />
      <Container112 />
      <Container113 />
      <Container114 />
      <Container115 />
      <Container116 />
      <Container117 />
      <Container118 />
      <Container119 />
      <Container120 />
      <Container121 />
      <Container122 />
    </div>
  );
}

function Span21() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[13.758px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">Low</p>
      </div>
    </div>
  );
}

function Span22() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[87.078px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">Each block = zone section</p>
      </div>
    </div>
  );
}

function Span23() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[15.336px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">High</p>
      </div>
    </div>
  );
}

function Container123() {
  return (
    <div className="absolute content-stretch flex h-[10.5px] items-start justify-between left-0 top-[77.5px] w-[292px]" data-name="Container">
      <Span21 />
      <Span22 />
      <Span23 />
    </div>
  );
}

function Div26() {
  return (
    <div className="absolute h-[88px] left-[13px] top-[106.5px] w-[292px]" data-name="div">
      <Container89 />
      <Container90 />
      <Container123 />
    </div>
  );
}

function Div27() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-LD01</p>
    </div>
  );
}

function MotionDiv5() {
  return (
    <div className="bg-white col-2 justify-self-stretch relative rounded-[4px] row-2 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div24 />
      <Div25 />
      <Div26 />
      <Div27 />
    </div>
  );
}

function H6() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Retail Floor Zone 1</p>
    </div>
  );
}

function P6() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">People Heatmaps</p>
    </div>
  );
}

function Container124() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H6 />
        <P6 />
      </div>
    </div>
  );
}

function BarChart2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="BarChart3">
          <path d={svgPaths.p90824c0} id="Vector" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M12 11.3333V6" id="Vector_2" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8.66797 11.332V3.33203" id="Vector_3" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33203 11.332V9.33203" id="Vector_4" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div28() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container124 />
      <BarChart2 />
    </div>
  );
}

function Container127() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px] tracking-[0.225px] uppercase">Utilization</p>
    </div>
  );
}

function Container128() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-0 text-[#00775b] text-[20px] top-[-0.5px]">65%</p>
    </div>
  );
}

function Container126() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[57.906px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container127 />
        <Container128 />
      </div>
    </div>
  );
}

function Container130() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-[72.27px] not-italic text-[#64748b] text-[9px] text-right top-[0.5px] tracking-[0.225px] uppercase">Avg Dwell</p>
    </div>
  );
}

function Container131() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[72px] text-[#1e293b] text-[20px] text-right top-[-0.5px]">8m 32s</p>
    </div>
  );
}

function Container129() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[72px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container130 />
        <Container131 />
      </div>
    </div>
  );
}

function Container125() {
  return (
    <div className="content-stretch flex h-[41.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container126 />
      <Container129 />
    </div>
  );
}

function Div29() {
  return (
    <div className="absolute content-stretch flex flex-col h-[50.5px] items-start left-[13px] pb-px top-[48px] w-[292px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container125 />
    </div>
  );
}

function Container132() {
  return (
    <div className="absolute h-[13.5px] left-0 top-0 w-[292px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">Zone Density Map (4x8 Grid Sections)</p>
    </div>
  );
}

function Container134() {
  return <div className="bg-[#00a63e] col-1 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container135() {
  return <div className="bg-[#e19a04] col-2 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container136() {
  return <div className="bg-[#f0f2f4] col-3 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container137() {
  return <div className="bg-[#e7000b] col-4 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container138() {
  return <div className="bg-[#e7000b] col-5 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container139() {
  return <div className="bg-[#00a63e] col-6 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container140() {
  return <div className="bg-[#e19a04] col-7 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container141() {
  return <div className="bg-[#00a63e] col-8 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container142() {
  return <div className="bg-[#e19a04] col-1 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container143() {
  return <div className="bg-[#e7000b] col-2 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container144() {
  return <div className="bg-[#e7000b] col-3 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container145() {
  return <div className="bg-[#e7000b] col-4 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container146() {
  return <div className="bg-[#00a63e] col-5 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container147() {
  return <div className="bg-[#f0f2f4] col-6 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container148() {
  return <div className="bg-[#00a63e] col-7 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container149() {
  return <div className="bg-[#ea580c] col-8 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container150() {
  return <div className="bg-[#00a63e] col-1 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container151() {
  return <div className="bg-[#ea580c] col-2 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container152() {
  return <div className="bg-[#00a63e] col-3 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container153() {
  return <div className="bg-[#00a63e] col-4 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container154() {
  return <div className="bg-[#e7000b] col-5 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container155() {
  return <div className="bg-[#e19a04] col-6 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container156() {
  return <div className="bg-[#f0f2f4] col-7 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container157() {
  return <div className="bg-[#00a63e] col-8 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container158() {
  return <div className="bg-[#e7000b] col-1 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container159() {
  return <div className="bg-[#e7000b] col-2 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container160() {
  return <div className="bg-[#e7000b] col-3 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container161() {
  return <div className="bg-[#00a63e] col-4 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container162() {
  return <div className="bg-[#00a63e] col-5 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container163() {
  return <div className="bg-[#f0f2f4] col-6 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container164() {
  return <div className="bg-[#e7000b] col-7 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container165() {
  return <div className="bg-[#e7000b] col-8 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container133() {
  return (
    <div className="absolute gap-x-[2px] gap-y-[2px] grid grid-cols-[repeat(8,minmax(0,1fr))] grid-rows-[repeat(4,minmax(0,1fr))] h-[54px] left-0 top-[19.5px] w-[292px]" data-name="Container">
      <Container134 />
      <Container135 />
      <Container136 />
      <Container137 />
      <Container138 />
      <Container139 />
      <Container140 />
      <Container141 />
      <Container142 />
      <Container143 />
      <Container144 />
      <Container145 />
      <Container146 />
      <Container147 />
      <Container148 />
      <Container149 />
      <Container150 />
      <Container151 />
      <Container152 />
      <Container153 />
      <Container154 />
      <Container155 />
      <Container156 />
      <Container157 />
      <Container158 />
      <Container159 />
      <Container160 />
      <Container161 />
      <Container162 />
      <Container163 />
      <Container164 />
      <Container165 />
    </div>
  );
}

function Span24() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[13.758px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">Low</p>
      </div>
    </div>
  );
}

function Span25() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[87.078px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">Each block = zone section</p>
      </div>
    </div>
  );
}

function Span26() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[15.336px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">High</p>
      </div>
    </div>
  );
}

function Container166() {
  return (
    <div className="absolute content-stretch flex h-[10.5px] items-start justify-between left-0 top-[77.5px] w-[292px]" data-name="Container">
      <Span24 />
      <Span25 />
      <Span26 />
    </div>
  );
}

function Div30() {
  return (
    <div className="absolute h-[88px] left-[13px] top-[106.5px] w-[292px]" data-name="div">
      <Container132 />
      <Container133 />
      <Container166 />
    </div>
  );
}

function Div31() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-RF01</p>
    </div>
  );
}

function MotionDiv6() {
  return (
    <div className="bg-white col-3 justify-self-stretch relative rounded-[4px] row-2 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div28 />
      <Div29 />
      <Div30 />
      <Div31 />
    </div>
  );
}

function H7() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Cafeteria Line</p>
    </div>
  );
}

function P7() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">{`Queue Length & Wait Time`}</p>
    </div>
  );
}

function Container167() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H7 />
        <P7 />
      </div>
    </div>
  );
}

function Clock() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Clock">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2397_1968)" id="Clock">
          <path d={svgPaths.p171f8800} id="Vector" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 4V8L10.6667 9.33333" id="Vector_2" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_2397_1968">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div32() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container167 />
      <Clock />
    </div>
  );
}

function Container170() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px] tracking-[0.225px] uppercase">Queue Length</p>
    </div>
  );
}

function Container171() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-0 text-[#1e293b] text-[18px] top-0">8</p>
    </div>
  );
}

function Container169() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[72.555px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container170 />
        <Container171 />
      </div>
    </div>
  );
}

function Container173() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-[71px] not-italic text-[#64748b] text-[9px] text-right top-[0.5px] tracking-[0.225px] uppercase">Avg Wait Time</p>
    </div>
  );
}

function Container174() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[70.96px] text-[#00775b] text-[18px] text-right top-0">3m 25s</p>
    </div>
  );
}

function Container172() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[70.766px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container173 />
        <Container174 />
      </div>
    </div>
  );
}

function Container168() {
  return (
    <div className="content-stretch flex h-[41.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container169 />
      <Container172 />
    </div>
  );
}

function Div33() {
  return (
    <div className="absolute content-stretch flex flex-col h-[50.5px] items-start left-[13px] pb-px top-[48px] w-[292px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container168 />
    </div>
  );
}

function Container175() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">Last Hour Trend</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[3.13%_0.68%_96.88%_0.68%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 288 1">
          <g id="Group">
            <path d={svgPaths.p28b7cf00} id="Vector" stroke="var(--stroke-0, #94A3B8)" strokeDasharray="3 3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[3.13%_0.68%_96.88%_0.68%]" data-name="Group">
      <div className="absolute inset-[-1px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 288 2">
          <g id="Group">
            <path d={svgPaths.p24b70e00} id="Vector" stroke="var(--stroke-0, #00775B)" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute h-[64px] left-0 overflow-clip top-0 w-[292px]" data-name="Icon">
      <Group />
      <Group1 />
    </div>
  );
}

function LineChart() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="LineChart">
      <Icon />
    </div>
  );
}

function Container177() {
  return <div className="bg-[#00775b] h-[8px] shrink-0 w-full" data-name="Container" />;
}

function Container176() {
  return (
    <div className="bg-[#f1f5f9] h-[8px] relative rounded-[16777200px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pr-[116.805px] relative size-full">
          <Container177 />
        </div>
      </div>
    </div>
  );
}

function Span27() {
  return (
    <div className="h-[12px] relative shrink-0 w-[40.398px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">SLA: 5 min</p>
      </div>
    </div>
  );
}

function Span28() {
  return (
    <div className="h-[12px] relative shrink-0 w-[17.867px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">60%</p>
      </div>
    </div>
  );
}

function Container178() {
  return (
    <div className="content-stretch flex h-[12px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Span27 />
      <Span28 />
    </div>
  );
}

function Div34() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[109.5px] items-start left-[13px] top-[106.5px] w-[292px]" data-name="div">
      <Container175 />
      <LineChart />
      <Container176 />
      <Container178 />
    </div>
  );
}

function Div35() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-CF01</p>
    </div>
  );
}

function MotionDiv7() {
  return (
    <div className="bg-white col-4 justify-self-stretch relative rounded-[4px] row-2 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div32 />
      <Div33 />
      <Div34 />
      <Div35 />
    </div>
  );
}

function H8() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Lobby Waiting Area</p>
    </div>
  );
}

function P8() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Dwell Time Analytics</p>
    </div>
  );
}

function Container179() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H8 />
        <P8 />
      </div>
    </div>
  );
}

function BarChart3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="BarChart3">
          <path d={svgPaths.p90824c0} id="Vector" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M12 11.3333V6" id="Vector_2" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8.66797 11.332V3.33203" id="Vector_3" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33203 11.332V9.33203" id="Vector_4" stroke="var(--stroke-0, #00775B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div36() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container179 />
      <BarChart3 />
    </div>
  );
}

function Container182() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px] tracking-[0.225px] uppercase">Utilization</p>
    </div>
  );
}

function Container183() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-0 text-[#00775b] text-[20px] top-[-0.5px]">45%</p>
    </div>
  );
}

function Container181() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[57.906px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container182 />
        <Container183 />
      </div>
    </div>
  );
}

function Container185() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-[84.27px] not-italic text-[#64748b] text-[9px] text-right top-[0.5px] tracking-[0.225px] uppercase">Avg Dwell</p>
    </div>
  );
}

function Container186() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[84px] text-[#1e293b] text-[20px] text-right top-[-0.5px]">12m 08s</p>
    </div>
  );
}

function Container184() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[84px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container185 />
        <Container186 />
      </div>
    </div>
  );
}

function Container180() {
  return (
    <div className="content-stretch flex h-[41.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container181 />
      <Container184 />
    </div>
  );
}

function Div37() {
  return (
    <div className="absolute content-stretch flex flex-col h-[50.5px] items-start left-[13px] pb-px top-[48px] w-[292px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container180 />
    </div>
  );
}

function Container187() {
  return (
    <div className="absolute h-[13.5px] left-0 top-0 w-[292px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">Zone Density Map (4x8 Grid Sections)</p>
    </div>
  );
}

function Container189() {
  return <div className="bg-[#ea580c] col-1 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container190() {
  return <div className="bg-[#e19a04] col-2 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container191() {
  return <div className="bg-[#e7000b] col-3 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container192() {
  return <div className="bg-[#e7000b] col-4 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container193() {
  return <div className="bg-[#00a63e] col-5 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container194() {
  return <div className="bg-[#e7000b] col-6 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container195() {
  return <div className="bg-[#e7000b] col-7 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container196() {
  return <div className="bg-[#e19a04] col-8 justify-self-stretch rounded-[4px] row-1 self-stretch shrink-0" data-name="Container" />;
}

function Container197() {
  return <div className="bg-[#ea580c] col-1 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container198() {
  return <div className="bg-[#e19a04] col-2 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container199() {
  return <div className="bg-[#e7000b] col-3 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container200() {
  return <div className="bg-[#ea580c] col-4 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container201() {
  return <div className="bg-[#00a63e] col-5 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container202() {
  return <div className="bg-[#e7000b] col-6 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container203() {
  return <div className="bg-[#e7000b] col-7 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container204() {
  return <div className="bg-[#e7000b] col-8 justify-self-stretch rounded-[4px] row-2 self-stretch shrink-0" data-name="Container" />;
}

function Container205() {
  return <div className="bg-[#e7000b] col-1 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container206() {
  return <div className="bg-[#e7000b] col-2 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container207() {
  return <div className="bg-[#ea580c] col-3 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container208() {
  return <div className="bg-[#ea580c] col-4 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container209() {
  return <div className="bg-[#00a63e] col-5 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container210() {
  return <div className="bg-[#e7000b] col-6 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container211() {
  return <div className="bg-[#e19a04] col-7 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container212() {
  return <div className="bg-[#e19a04] col-8 justify-self-stretch rounded-[4px] row-3 self-stretch shrink-0" data-name="Container" />;
}

function Container213() {
  return <div className="bg-[#f0f2f4] col-1 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container214() {
  return <div className="bg-[#e7000b] col-2 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container215() {
  return <div className="bg-[#e7000b] col-3 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container216() {
  return <div className="bg-[#e7000b] col-4 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container217() {
  return <div className="bg-[#e19a04] col-5 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container218() {
  return <div className="bg-[#e19a04] col-6 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container219() {
  return <div className="bg-[#e19a04] col-7 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container220() {
  return <div className="bg-[#f0f2f4] col-8 justify-self-stretch rounded-[4px] row-4 self-stretch shrink-0" data-name="Container" />;
}

function Container188() {
  return (
    <div className="absolute gap-x-[2px] gap-y-[2px] grid grid-cols-[repeat(8,minmax(0,1fr))] grid-rows-[repeat(4,minmax(0,1fr))] h-[54px] left-0 top-[19.5px] w-[292px]" data-name="Container">
      <Container189 />
      <Container190 />
      <Container191 />
      <Container192 />
      <Container193 />
      <Container194 />
      <Container195 />
      <Container196 />
      <Container197 />
      <Container198 />
      <Container199 />
      <Container200 />
      <Container201 />
      <Container202 />
      <Container203 />
      <Container204 />
      <Container205 />
      <Container206 />
      <Container207 />
      <Container208 />
      <Container209 />
      <Container210 />
      <Container211 />
      <Container212 />
      <Container213 />
      <Container214 />
      <Container215 />
      <Container216 />
      <Container217 />
      <Container218 />
      <Container219 />
      <Container220 />
    </div>
  );
}

function Span29() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[13.758px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">Low</p>
      </div>
    </div>
  );
}

function Span30() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[87.078px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">Each block = zone section</p>
      </div>
    </div>
  );
}

function Span31() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[15.336px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[10.5px] left-0 not-italic text-[#94a3b8] text-[7px] top-0">High</p>
      </div>
    </div>
  );
}

function Container221() {
  return (
    <div className="absolute content-stretch flex h-[10.5px] items-start justify-between left-0 top-[77.5px] w-[292px]" data-name="Container">
      <Span29 />
      <Span30 />
      <Span31 />
    </div>
  );
}

function Div38() {
  return (
    <div className="absolute h-[88px] left-[13px] top-[106.5px] w-[292px]" data-name="div">
      <Container187 />
      <Container188 />
      <Container221 />
    </div>
  );
}

function Div39() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-LW01</p>
    </div>
  );
}

function MotionDiv8() {
  return (
    <div className="bg-white col-1 justify-self-stretch relative rounded-[4px] row-3 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div36 />
      <Div37 />
      <Div38 />
      <Div39 />
    </div>
  );
}

function H9() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Emergency Exit B</p>
    </div>
  );
}

function P9() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Entry into Hazardous Zones</p>
    </div>
  );
}

function Container222() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H9 />
        <P9 />
      </div>
    </div>
  );
}

function Shield2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Shield">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Shield">
          <path d={svgPaths.pb794cb2} id="Vector" stroke="var(--stroke-0, #94A3B8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div40() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container222 />
      <Shield2 />
    </div>
  );
}

function Container223() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[146px] text-[#1e293b] text-[20px] text-center top-[-0.5px]">0</p>
    </div>
  );
}

function Container224() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-[145.77px] not-italic text-[#64748b] text-[8px] text-center top-0 tracking-[0.2px] uppercase">Detected Objects</p>
    </div>
  );
}

function Div41() {
  return (
    <div className="absolute content-stretch flex flex-col h-[40px] items-start left-[13px] top-[48px] w-[292px]" data-name="div">
      <Container223 />
      <Container224 />
    </div>
  );
}

function Span32() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[70.203px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[13.5px] left-0 text-[#94a3b8] text-[9px] top-0">Time in Area:</p>
      </div>
    </div>
  );
}

function Span33() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[16.203px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[13.5px] left-0 text-[#00956d] text-[9px] top-0">N/A</p>
      </div>
    </div>
  );
}

function Container225() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Span32 />
      <Span33 />
    </div>
  );
}

function Span34() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[81px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[13.5px] left-0 text-[#94a3b8] text-[9px] top-0">Last Detection:</p>
      </div>
    </div>
  );
}

function Span35() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[16.203px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[13.5px] left-0 text-[9px] text-white top-0">N/A</p>
      </div>
    </div>
  );
}

function Container226() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Span34 />
      <Span35 />
    </div>
  );
}

function Div42() {
  return (
    <div className="absolute bg-[#0f172a] content-stretch flex flex-col gap-[4px] h-[47px] items-start left-[13px] pt-[8px] px-[8px] rounded-[4px] top-[96px] w-[292px]" data-name="div">
      <Container225 />
      <Container226 />
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#e7000b] flex-[1_0_0] h-[20px] min-h-px min-w-px relative rounded-[4px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[12px] left-[71.06px] not-italic text-[8px] text-center text-white top-[4px] uppercase">Verify</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#e2e8f0] flex-[1_0_0] h-[20px] min-h-px min-w-px relative rounded-[4px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[12px] left-[70.56px] not-italic text-[#334155] text-[8px] text-center top-[4px] uppercase">Flag</p>
      </div>
    </div>
  );
}

function Div43() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[20px] items-center left-[13px] top-[151px] w-[292px]" data-name="div">
      <Button4 />
      <Button5 />
    </div>
  );
}

function Div44() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[267.4px] rounded-[4px] top-[9px] w-[41.602px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-EX02</p>
    </div>
  );
}

function MotionDiv9() {
  return (
    <div className="bg-white col-2 justify-self-stretch relative rounded-[4px] row-3 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div40 />
      <Div41 />
      <Div42 />
      <Div43 />
      <Div44 />
    </div>
  );
}

function H10() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Warehouse Zone A</p>
    </div>
  );
}

function P10() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Overcrowding Alerts</p>
    </div>
  );
}

function Container227() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H10 />
        <P10 />
      </div>
    </div>
  );
}

function Users() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Users">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Users">
          <path d={svgPaths.p17627104} id="Vector" stroke="var(--stroke-0, #E7000B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pba83280} id="Vector_2" stroke="var(--stroke-0, #E7000B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p13d84a80} id="Vector_3" stroke="var(--stroke-0, #E7000B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p110f9d80} id="Vector_4" stroke="var(--stroke-0, #E7000B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Div45() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container227 />
      <Users />
    </div>
  );
}

function Span36() {
  return (
    <div className="absolute content-stretch flex h-[32px] items-start left-[114.99px] top-0 w-[28.805px]" data-name="span">
      <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[32px] relative shrink-0 text-[#e7000b] text-[24px] text-center">29</p>
    </div>
  );
}

function Span37() {
  return (
    <div className="absolute h-[20px] left-[147.8px] top-[9.5px] w-[8.406px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[20px] left-[4.5px] text-[#94a3b8] text-[14px] text-center top-[-0.5px]">/</p>
    </div>
  );
}

function Span38() {
  return (
    <div className="absolute h-[20px] left-[160.2px] top-[9.5px] w-[16.805px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[20px] left-[8.5px] text-[#64748b] text-[14px] text-center top-[-0.5px]">30</p>
    </div>
  );
}

function Container228() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <Span36 />
      <Span37 />
      <Span38 />
    </div>
  );
}

function Container229() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-[146.35px] not-italic text-[#64748b] text-[8px] text-center top-0 tracking-[0.2px] uppercase">People in Zone (95% Capacity)</p>
    </div>
  );
}

function Div46() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[2px] h-[55px] items-start left-[13px] pb-px top-[48px] w-[292px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container228 />
      <Container229 />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative size-[80px]" data-name="svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
        <g id="svg">
          <path d={svgPaths.p2138fe00} id="Vector" stroke="var(--stroke-0, #E5E7EB)" strokeWidth="6" />
          <path d={svgPaths.p2138fe00} id="Vector_2" stroke="var(--stroke-0, #E7000B)" strokeDasharray="190.95 201" strokeLinecap="round" strokeWidth="6" />
        </g>
      </svg>
    </div>
  );
}

function Container232() {
  return (
    <div className="h-[28px] relative shrink-0 w-[32.406px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-0 text-[#e7000b] text-[18px] top-0">95%</p>
      </div>
    </div>
  );
}

function Container231() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-0 size-[80px] top-0" data-name="Container">
      <Container232 />
    </div>
  );
}

function Container230() {
  return (
    <div className="absolute left-[106px] size-[80px] top-0" data-name="Container">
      <div className="absolute flex items-center justify-center left-0 size-[80px] top-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Svg />
        </div>
      </div>
      <Container231 />
    </div>
  );
}

function Div47() {
  return (
    <div className="absolute h-[80px] left-[13px] top-[111px] w-[292px]" data-name="div">
      <Container230 />
    </div>
  );
}

function Div48() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[271.59px] rounded-[4px] top-[9px] w-[37.406px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-W01</p>
    </div>
  );
}

function Div49() {
  return <div className="absolute bg-[#e7000b] left-[309.89px] opacity-78 rounded-[16777200px] size-[12.208px] top-[-4.11px]" data-name="div" />;
}

function MotionDiv10() {
  return (
    <div className="bg-[#ffe5e7] col-3 justify-self-stretch relative rounded-[4px] row-3 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#e7000b] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_0px_15px_0px_rgba(231,0,11,0.4)]" />
      <Div45 />
      <Div46 />
      <Div47 />
      <Div48 />
      <Div49 />
    </div>
  );
}

function H11() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#1e293b] text-[10px] top-[0.5px] uppercase">Main Entrance Queue</p>
    </div>
  );
}

function P11() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">Queue Management</p>
    </div>
  );
}

function Container233() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H11 />
        <P11 />
      </div>
    </div>
  );
}

function Clock1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Clock">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2397_1931)" id="Clock">
          <path d={svgPaths.p171f8800} id="Vector" stroke="var(--stroke-0, #EA580C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 4V8L10.6667 9.33333" id="Vector_2" stroke="var(--stroke-0, #EA580C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_2397_1931">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div50() {
  return (
    <div className="absolute content-stretch flex h-[27px] items-start justify-between left-[13px] top-[13px] w-[292px]" data-name="div">
      <Container233 />
      <Clock1 />
    </div>
  );
}

function Container236() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px] tracking-[0.225px] uppercase">Queue Length</p>
    </div>
  );
}

function Container237() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-0 text-[#1e293b] text-[18px] top-0">12</p>
    </div>
  );
}

function Container235() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[72.555px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container236 />
        <Container237 />
      </div>
    </div>
  );
}

function Container239() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-[71px] not-italic text-[#64748b] text-[9px] text-right top-[0.5px] tracking-[0.225px] uppercase">Avg Wait Time</p>
    </div>
  );
}

function Container240() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[28px] left-[70.96px] text-[#ea580c] text-[18px] text-right top-0">8m 15s</p>
    </div>
  );
}

function Container238() {
  return (
    <div className="h-[41.5px] relative shrink-0 w-[70.766px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container239 />
        <Container240 />
      </div>
    </div>
  );
}

function Container234() {
  return (
    <div className="absolute content-stretch flex h-[41.5px] items-start justify-between left-0 top-0 w-[292px]" data-name="Container">
      <Container235 />
      <Container238 />
    </div>
  );
}

function Span39() {
  return (
    <div className="absolute bg-[#ea580c] content-stretch flex h-[14px] items-start left-[112.71px] px-[8px] py-[2px] rounded-[4px] top-[53px] w-[66.57px]" data-name="span">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[12px] not-italic relative shrink-0 text-[8px] text-center text-white uppercase">SLA Breach</p>
    </div>
  );
}

function Div51() {
  return (
    <div className="absolute border-[#f1f5f9] border-b border-solid h-[78.5px] left-[13px] top-[48px] w-[292px]" data-name="div">
      <Container234 />
      <Span39 />
    </div>
  );
}

function Container241() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-0 not-italic text-[#64748b] text-[9px] top-[0.5px]">Last Hour Trend</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[21.88%_0.68%_78.13%_0.68%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 288 1">
          <g id="Group">
            <path d={svgPaths.p28b7cf00} id="Vector" stroke="var(--stroke-0, #94A3B8)" strokeDasharray="3 3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[21.88%_0.68%_78.13%_0.68%]" data-name="Group">
      <div className="absolute inset-[-1px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 288 2">
          <g id="Group">
            <path d={svgPaths.p24b70e00} id="Vector" stroke="var(--stroke-0, #EA580C)" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute h-[64px] left-0 overflow-clip top-0 w-[292px]" data-name="Icon">
      <Group2 />
      <Group3 />
    </div>
  );
}

function LineChart1() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="LineChart">
      <Icon1 />
    </div>
  );
}

function Container242() {
  return <div className="bg-[#ea580c] h-[8px] rounded-[16777200px] shrink-0 w-full" data-name="Container" />;
}

function Span40() {
  return (
    <div className="h-[12px] relative shrink-0 w-[40.398px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">SLA: 5 min</p>
      </div>
    </div>
  );
}

function Span41() {
  return (
    <div className="h-[12px] relative shrink-0 w-[21.211px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[12px] left-0 not-italic text-[#64748b] text-[8px] top-0">100%</p>
      </div>
    </div>
  );
}

function Container243() {
  return (
    <div className="content-stretch flex h-[12px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Span40 />
      <Span41 />
    </div>
  );
}

function Div52() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[109.5px] items-start left-[13px] top-[134.5px] w-[292px]" data-name="div">
      <Container241 />
      <LineChart1 />
      <Container242 />
      <Container243 />
    </div>
  );
}

function Div53() {
  return (
    <div className="absolute bg-[rgba(15,23,42,0.7)] h-[14.5px] left-[271.59px] rounded-[4px] top-[9px] w-[37.406px]" data-name="div">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[10.5px] left-[4px] text-[7px] text-white top-[1.5px]">Cam-E01</p>
    </div>
  );
}

function MotionDiv11() {
  return (
    <div className="bg-[#feefe7] col-4 justify-self-stretch relative rounded-[4px] row-3 self-stretch shrink-0" data-name="motion.div">
      <div aria-hidden="true" className="absolute border border-[#ea580c] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Div50 />
      <Div51 />
      <Div52 />
      <Div53 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[___minmax(0,215.50fr)_minmax(0,237fr)_minmax(0,1fr)] relative size-full" data-name="Container">
      <MotionDiv />
      <MotionDiv1 />
      <MotionDiv2 />
      <MotionDiv3 />
      <MotionDiv4 />
      <MotionDiv5 />
      <MotionDiv6 />
      <MotionDiv7 />
      <MotionDiv8 />
      <MotionDiv9 />
      <MotionDiv10 />
      <MotionDiv11 />
    </div>
  );
}
import svgPaths from "./svg-segs5gnz07";

function Paragraph() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[16px] left-0 not-italic text-[12px] text-white top-[0.5px] tracking-[0.5px] uppercase whitespace-nowrap">Total Incidents</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[32px] relative shrink-0 w-[51.75px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[32px] left-0 text-[30px] text-white top-0 tracking-[-0.75px] whitespace-nowrap">142</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[18px] relative shrink-0 w-[32.414px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[18px] left-0 text-[#00a63e] text-[18px] top-0 whitespace-nowrap">-8%</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.pa1bcac0} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2f7f3780} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[4px] h-[18px] items-center relative shrink-0 w-full" data-name="Container">
      <Text />
      <Icon />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[14.398px] opacity-80 relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[14.4px] left-0 not-italic text-[#00a63e] text-[9px] top-[0.5px] tracking-[0.225px] uppercase whitespace-nowrap">vs last week</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#e5ffef] h-[44.398px] relative rounded-[4px] shrink-0 w-[87.828px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(185,248,207,0.5)] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start pb-px pt-[5px] px-[9px] relative size-full">
        <Container5 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex h-[44.398px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Paragraph1 />
      <Container4 />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-[#021d18] content-stretch flex flex-col gap-[16px] h-[131px] items-start left-0 pt-[12px] px-[12px] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-0 w-[340px]" data-name="Container">
      <Paragraph />
      <Container3 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[16px] left-0 not-italic text-[12px] text-white top-[0.5px] tracking-[0.5px] uppercase whitespace-nowrap">Mean Time to Acknowledge</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[32px] left-0 text-[30px] text-white top-0 tracking-[-0.75px] whitespace-nowrap">15.2s</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-0 not-italic text-[#00a63e] text-[10px] top-0 tracking-[0.225px] uppercase whitespace-nowrap">{`✓ Target: <20s`}</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[52px] relative shrink-0 w-[86.25px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Paragraph4 />
        <Paragraph5 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[18px] relative shrink-0 w-[32.414px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[18px] left-0 text-[#00a63e] text-[18px] top-0 whitespace-nowrap">-3s</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.pa1bcac0} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2f7f3780} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[4px] h-[18px] items-center relative shrink-0 w-full" data-name="Container">
      <Text1 />
      <Icon1 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[14.398px] opacity-80 relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[14.4px] left-0 not-italic text-[#00a63e] text-[9px] top-[0.5px] tracking-[0.225px] uppercase whitespace-nowrap">vs last week</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[#e5ffef] h-[44.398px] relative rounded-[4px] shrink-0 w-[87.828px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(185,248,207,0.5)] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start pb-px pt-[5px] px-[9px] relative size-full">
        <Container10 />
        <Paragraph6 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex h-[52px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Container9 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-[#021d18] content-stretch flex flex-col gap-[16px] h-[131px] items-start left-[349px] pt-[12px] px-[12px] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-0 w-[340px]" data-name="Container">
      <Paragraph3 />
      <Container7 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[16px] left-0 not-italic text-[12px] text-white top-[0.5px] tracking-[0.5px] uppercase whitespace-nowrap">Mean Time to Resolve</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[32px] left-0 text-[30px] text-white top-0 tracking-[-0.75px] whitespace-nowrap">6.75m</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-0 not-italic text-[#e7000b] text-[10px] top-0 tracking-[0.225px] uppercase whitespace-nowrap">Approaching SLA</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[52px] relative shrink-0 w-[97.547px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Paragraph8 />
        <Paragraph9 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Text">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[18px] left-[23.29px] text-[#e7000b] text-[14px] text-center top-[-0.5px] whitespace-nowrap">8m</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[14.398px] opacity-80 relative shrink-0 w-full" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[14.4px] left-[23.5px] not-italic text-[#e7000b] text-[9px] text-center top-[0.5px] tracking-[0.225px] uppercase whitespace-nowrap">SLA limit</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[#ffe5e7] h-[42.398px] relative rounded-[4px] shrink-0 w-[64.398px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(231,0,11,0.2)] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px pt-[5px] px-[9px] relative size-full">
        <Text2 />
        <Paragraph10 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex h-[52px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute bg-[#021d18] content-stretch flex flex-col gap-[16px] h-[131px] items-start left-0 pt-[12px] px-[12px] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-[138px] w-[340px]" data-name="Container">
      <Paragraph7 />
      <Container12 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[16px] left-0 not-italic text-[12px] text-white top-[0.5px] tracking-[0.5px] uppercase whitespace-nowrap">False Positive Rate</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[32px] left-0 text-[30px] text-white top-0 tracking-[-0.75px] whitespace-nowrap">4.2%</p>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-0 not-italic text-[#00a63e] text-[10px] top-0 tracking-[0.225px] uppercase whitespace-nowrap">✓ Within Range</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[52px] relative shrink-0 w-[88.57px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Paragraph12 />
        <Paragraph13 />
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Text">
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[18px] left-[19.1px] text-[#00a63e] text-[14px] text-center top-[-0.5px] whitespace-nowrap">{`<5%`}</p>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[14.398px] opacity-80 relative shrink-0 w-full" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[14.4px] left-[19px] not-italic text-[#00a63e] text-[9px] text-center top-[0.5px] tracking-[0.225px] uppercase whitespace-nowrap">target</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="bg-[#e5ffef] h-[42.398px] relative rounded-[4px] shrink-0 w-[55.422px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(185,248,207,0.5)] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px pt-[5px] px-[9px] relative size-full">
        <Text3 />
        <Paragraph14 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex h-[52px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute bg-[#021d18] content-stretch flex flex-col gap-[16px] h-[131px] items-start left-[349px] pt-[12px] px-[12px] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-[138px] w-[340px]" data-name="Container">
      <Paragraph11 />
      <Container16 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute bottom-1/2 left-[58.86%] right-[34.8%] top-[32.92%]" data-name="Group">
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
    <div className="absolute inset-[14.84%_37.26%_62.79%_47.12%]" data-name="Group">
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
    <div className="absolute inset-[16.03%_52.61%_30.38%_34.8%]" data-name="Group">
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
    <div className="absolute inset-[51.63%_34.83%_14.84%_38.01%]" data-name="Group">
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
    <div className="absolute contents inset-[14.84%_34.8%]" data-name="Group">
      <Group1 />
      <Group2 />
      <Group3 />
      <Group4 />
    </div>
  );
}

function Surface() {
  return (
    <div className="absolute h-[256px] left-0 overflow-clip top-0 w-[592px]" data-name="Surface">
      <Group />
    </div>
  );
}

function PieChart() {
  return (
    <div className="absolute h-[256px] left-[-166px] top-[24px] w-[592px]" data-name="PieChart">
      <Surface />
    </div>
  );
}

function Container22() {
  return <div className="absolute bg-[#e7000b] left-0 rounded-[2px] size-[10px] top-[3px]" data-name="Container" />;
}

function Text4() {
  return (
    <div className="absolute h-[13.328px] left-[16px] top-[1.34px] w-[47.234px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[13.333px] left-0 not-italic text-[#475569] text-[10px] top-[0.5px] tracking-[0.25px] uppercase whitespace-nowrap">Critical</p>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[73.23px] top-0 w-[14.406px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#94a3b8] text-[12px] whitespace-nowrap">12</p>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[16px] relative shrink-0 w-[87.641px]" data-name="Container">
      <Container22 />
      <Text4 />
      <Text5 />
    </div>
  );
}

function Container24() {
  return <div className="absolute bg-[#ea580c] left-0 rounded-[2px] size-[10px] top-[3px]" data-name="Container" />;
}

function Text6() {
  return (
    <div className="absolute h-[13.328px] left-[16px] top-[1.34px] w-[26.016px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[13.333px] left-0 not-italic text-[#475569] text-[10px] top-[0.5px] tracking-[0.25px] uppercase whitespace-nowrap">High</p>
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[52.02px] top-0 w-[14.406px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#94a3b8] text-[12px] whitespace-nowrap">28</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[16px] relative shrink-0 w-[66.422px]" data-name="Container">
      <Container24 />
      <Text6 />
      <Text7 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start justify-center relative shrink-0">
      <Container21 />
      <Container23 />
    </div>
  );
}

function Container26() {
  return <div className="absolute bg-[#e19a04] left-0 rounded-[2px] size-[10px] top-[3px]" data-name="Container" />;
}

function Text8() {
  return (
    <div className="absolute h-[13.328px] left-[16px] top-[1.34px] w-[42.922px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[13.333px] left-0 not-italic text-[#475569] text-[10px] top-[0.5px] tracking-[0.25px] uppercase whitespace-nowrap">Medium</p>
    </div>
  );
}

function Text9() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[68.92px] top-0 w-[14.406px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#94a3b8] text-[12px] whitespace-nowrap">45</p>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[16px] relative shrink-0 w-[83.328px]" data-name="Container">
      <Container26 />
      <Text8 />
      <Text9 />
    </div>
  );
}

function Container28() {
  return <div className="absolute bg-[#2b7fff] left-0 rounded-[2px] size-[10px] top-[3px]" data-name="Container" />;
}

function Text10() {
  return (
    <div className="absolute h-[13.328px] left-[16px] top-[1.34px] w-[23.625px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[13.333px] left-0 not-italic text-[#475569] text-[10px] top-[0.5px] tracking-[0.25px] uppercase whitespace-nowrap">Low</p>
    </div>
  );
}

function Text11() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[49.63px] top-0 w-[14.406px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#94a3b8] text-[12px] whitespace-nowrap">57</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[16px] relative shrink-0 w-[64.031px]" data-name="Container">
      <Container28 />
      <Text10 />
      <Text11 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start justify-center relative shrink-0">
      <Container25 />
      <Container27 />
    </div>
  );
}

function Container20() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[12px] items-start justify-center left-[calc(50%+102.32px)] top-[99px]" data-name="Container">
      <Frame1 />
      <Frame />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[20px] left-[24px] top-[24px] w-[187.297px]" data-name="Heading 3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#334155] text-[14px] top-[0.5px] tracking-[0.7px] uppercase whitespace-nowrap">Severity Distribution</p>
    </div>
  );
}

function Text12() {
  return (
    <div className="h-[40px] relative shrink-0 w-[64.805px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[40px] left-0 text-[#0f172a] text-[36px] top-0 whitespace-nowrap">142</p>
      </div>
    </div>
  );
}

function Text13() {
  return (
    <div className="h-[15px] relative shrink-0 w-[97.242px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[15px] left-0 not-italic text-[#94a3b8] text-[10px] top-[0.5px] tracking-[0.5px] uppercase whitespace-nowrap">Total Incidents</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute content-stretch flex flex-col h-[372px] items-center justify-center left-[-190px] py-[158.5px] top-[-30px] w-[640px]" data-name="Container">
      <Text12 />
      <Text13 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute bg-white border border-[#e2e8f0] border-solid h-[269px] left-[712px] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] top-0 w-[517px]" data-name="Container">
      <PieChart />
      <Container20 />
      <Heading />
      <Container29 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[437px] left-0 top-0 w-[972px]" data-name="Container">
      <Container2 />
      <Container6 />
      <Container11 />
      <Container15 />
      <Container19 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container">
      <Container1 />
    </div>
  );
}
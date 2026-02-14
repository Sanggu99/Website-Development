import React from 'react';

const Service: React.FC = () => {
    const serviceList = [
        {
            titleEn: 'Business Development',
            titleKr: '사업계획',
            desc: '사업주의 정확한 의향과 목적 등의 요구조건을 확인하고 법규검토 및 입지환경의 현재와 장래성, 시설의 수급상황, 경합성 등을 조사하여 도입가능 용도 및 용량을 결정합니다. 사업의 목적을 달성하기 위한 구체적인 계획과 전략을 수립함으로써 개발형 프로젝트의 핵심분야에 대한 일괄적인 솔루션을 제공하고 있습니다.',
            image: '/Service image/사업계획.jpg'
        },
        {
            titleEn: 'Architectural Design',
            titleKr: '건축설계',
            desc: '사업주의 의도와 목적을 바탕으로 요구조건을 분석하고, 관련 법규 검토와 입지환경, 시설 수급 및 경쟁 여건을 종합적으로 검토하여 도입 가능한 용도와 규모를 설정합니다. 이를 토대로 건축물의 기능·형태·구조를 합리적으로 계획하고 도면을 통해 구체화함으로써, 경쟁력 있는 디자인과 전문적인 기술력을 바탕으로 실질적이고 완성도 높은 건축설계를 제공합니다.',
            image: '/Service image/건축설계.png'
        },
        {
            titleEn: 'Urban Design',
            titleKr: '도시설계',
            desc: '도시계획에 의해 수립되는 도시계획시설 및 토지이용 계획을 바탕으로, 건축물과 공공시설의 위치·규모·용도·형태를 종합적으로 검토하여 도시 공간의 구조와 운영 방향을 설정합니다. 신도시 계획, 대규모 단지의 마스터플랜, 지구단위계획 수립 등을 통해 도시의 물리적 환경을 체계적으로 조직하고, 도시계획과 건축설계의 연계를 통해 지속 가능하고 합리적인 도시환경 조성을 위한 설계 서비스를 제공합니다.',
            image: '/Service image/도시설계.jpg'
        },
        {
            titleEn: 'Sustainable Design',
            titleKr: '친환경설계',
            desc: '지속 가능한 개발을 목표로 인간과 자연이 조화롭게 공생하는 건축 환경을 계획·설계하며, 에너지와 자원의 효율적 활용을 통해 환경 부하를 최소화하고 쾌적한 공간 구현을 지향합니다. 설계 초기 단계부터 환경 성능 검토와 시뮬레이션, 패시브 디자인 및 신재생 에너지 시스템 제안을 통해 에너지 절감 효과가 극대화된 친환경 건축을 구현합니다.',
            image: '/Service image/친환경설계.jpg'
        },
        {
            titleEn: 'Remodeling',
            titleKr: '리모델링',
            desc: '기존 건축물의 물리적 조건과 사용 현황, 구조·설비 상태를 종합적으로 분석하여 공간의 기능과 가치를 재정립하고, 변화된 요구와 환경에 대응하는 합리적인 리모델링 계획을 수립합니다. 건축물의 잠재력을 존중하면서도 기능 개선과 성능 향상을 동시에 고려한 설계를 통해, 지속 가능하고 경쟁력 있는 건축 자산으로 재탄생시키는 리모델링 서비스를 제공합니다.',
            image: '/Service image/리모델링.jpg'
        },
        {
            titleEn: 'Construction Management',
            titleKr: '건설사업관리',
            desc: '프로젝트의 기획부터 설계, 시공, 운영 및 유지관리까지 건설사업 전 과정에서 고객의 대리인 및 조정자로서 참여하여 사업 기간 단축, 사업비 절감, 품질 향상을 통해 고객의 이익을 극대화 합니다. 다년간 축적된 설계 및 사업관리 경험을 바탕으로, 사업 초기 단계부터 리스크와 낭비 요소를 최소화하고 경제성·시공성·LCC 검토, 설계변경 및 공정·품질 관리를 통해 완성도 높은 건설사업을 체계적으로 관리합니다.',
            image: '/Service image/건설사업관리.jpg'
        }
    ];

    return (
        <div className="bg-white min-h-screen snap-y snap-mandatory scroll-smooth overflow-x-hidden">
            {/* 1. Philosophy Section */}
            <section id="service-philosophy" className="h-screen w-full bg-white flex flex-col snap-start relative">
                <div className="flex-1 flex items-center justify-center pt-[112px] px-6 md:px-24">
                    <div className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-12 md:gap-32 lg:gap-48">
                        <div className="flex-1 text-[#232A53]">
                            <h2 className="text-[30px] md:text-[42px] lg:text-[54px] font-poppins font-medium leading-[1.15] mb-12 tracking-[-0.03em] whitespace-nowrap uppercase">
                                DESIGNING WITH INSIGHT,<br />
                                BUILDING WITH PURPOSE.
                            </h2>
                            <div className="max-w-[700px] text-[18px] text-[#232A53] font-light leading-relaxed tracking-[-0.1em] break-keep opacity-80">
                                <p>
                                    에스이오피 건축은 "건축 설계를 중심으로, 각 분야의 검증된 전문가들이 협력하여 최고의 디자인 가치를 실현한다." 라는 생각을 담고 있습니다.
                                    우리는 건축설계를 중심으로, 인테리어, 친환경, 도시 계획, 마케팅, 해외 설계사(미주, 유럽, 동남아), 개발 컨설팅 등 다양한 분야의 전문가들과 협업 체계를 구축하고 있으며,
                                    수평적 조직 안에서 창의적이고 실질적인 솔루션을 제공합니다. 우리는 공공청사, 복합 문화시설, 공동주택, 주상복합, 호텔·리조트 등 다양한 유형의 프로젝트를 통해 도시와 사람, 삶과 환경 사이의 조화로운 관계를 고민해 왔습니다.
                                    지역성과 사용자 경험을 깊이 이해하며, 자연과 도시의 맥락 속에서 가치 있는 공간을 설계합니다.
                                    에스이오피 건축은 건축이 사회와 도시를 연결하는 언어라고 믿습니다. 설계의 본질을 지키면서도, 변화하는 시대와 환경에 유연하게 응답하고자 합니다.
                                    축적된 경험과 열린 태도를 바탕으로, 새로운 조건과 낯선 흐름 앞에서도 흔들림 없이 건축적 해답을 제안할 준비가 되어 있습니다.
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block w-full md:w-5/12 lg:w-4/12 flex-shrink-0 group cursor-pointer">
                            <div className="aspect-[3/4.5] overflow-hidden">
                                <img
                                    src="/Service image/philosophy.jpg"
                                    alt="Philosophy"
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 zoom-in"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Service Header + First Item Snap */}
            <section className="h-screen w-full bg-white flex flex-col snap-start overflow-hidden">
                <div className="h-[50dvh] w-full flex flex-col md:flex-row items-stretch overflow-hidden">
                    <div className="md:w-1/2 px-6 md:px-14 lg:px-24 flex flex-col justify-center pt-[112px]">
                        <div className="max-w-xl mx-auto w-full">
                            <div className="w-[200%]">
                                {/* Service Title */}
                                <h2 className="text-4xl md:text-5xl lg:text-[72px] font-poppins font-medium text-[#232A53] mb-8 tracking-[-0.03em] leading-none uppercase">SERVICE</h2>
                                <div>
                                    <p className="text-sm md:text-[18px] text-gray-600 font-light break-keep leading-relaxed tracking-[-0.1em]">
                                        에스이오피 건축은 사업성 검토를 위한 개발계획부터 도시, 건축, CM 등 프로젝트의 처음부터 끝까지 모든 과정을 책임지는 전문가들로 구성되어 건축주의 소중한 바람을 책임감 있게 실현합니다.
                                        <br />
                                        민간 및 공공 부문 모두에 걸쳐 다수의 사업계획 경험을 바탕으로 기획부터 실행까지 방향성을 제시합니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2" />
                </div>

                {/* Lower Half: First Service Item */}
                <div className="h-[50dvh] flex flex-col md:flex-row w-full items-stretch group cursor-pointer">
                    <div className="md:w-1/2 p-10 md:p-14 lg:p-24 flex flex-col justify-center bg-[#F8F8F8]">
                        <div className="max-w-xl mx-auto w-full text-left">
                            <div className="mb-8">
                                <h3 className="text-[28px] md:text-[36px] lg:text-[50px] font-poppins font-medium text-[#232A53] leading-[1.1] mb-2 tracking-[-0.03em] uppercase">
                                    {serviceList[0].titleEn}
                                </h3>
                                <p className="text-base md:text-[20px] font-medium text-gray-600 tracking-[-0.1em]">
                                    {serviceList[0].titleKr}
                                </p>
                            </div>
                            <p className="text-sm md:text-[18px] text-gray-600 font-light leading-relaxed break-keep max-w-lg tracking-[-0.1em]">
                                {serviceList[0].desc}
                            </p>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative overflow-hidden bg-gray-50">
                        <img
                            src={serviceList[0].image}
                            alt={serviceList[0].titleEn}
                            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                </div>
            </section>

            {/* 3. Subsequent Service Items */}
            <div className="flex flex-col">
                {[1, 3, 5].map((startIndex) => (
                    <section key={startIndex} className={`${startIndex === 5 ? 'h-[50dvh]' : 'h-screen'} w-full flex flex-col snap-start overflow-hidden`}>
                        {serviceList.slice(startIndex, startIndex + 2).map((service, subIdx) => {
                            const isGray = (startIndex + subIdx) % 2 === 0;
                            return (
                                <div
                                    key={startIndex + subIdx}
                                    className={`flex flex-col md:flex-row w-full items-stretch h-[50dvh] group cursor-pointer`}
                                >
                                    <div className={`md:w-1/2 p-10 md:p-14 lg:p-24 flex flex-col justify-center ${isGray ? 'bg-[#F8F8F8]' : 'bg-white'}`}>
                                        <div className="max-w-xl mx-auto w-full text-left font-poppins">
                                            <div className="mb-8">
                                                <h3 className="text-[28px] md:text-[36px] lg:text-[50px] font-medium text-[#232A53] leading-[1.1] mb-2 tracking-[-0.03em] uppercase">
                                                    {service.titleEn}
                                                </h3>
                                                <p className="text-base md:text-[20px] font-medium text-gray-600 font-sans tracking-[-0.1em]">
                                                    {service.titleKr}
                                                </p>
                                            </div>
                                            <p className="text-sm md:text-[18px] text-gray-600 font-light leading-relaxed break-keep max-w-lg font-sans tracking-[-0.1em]">
                                                {service.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="md:w-1/2 relative overflow-hidden bg-gray-50">
                                        <img
                                            src={service.image}
                                            alt={service.titleEn}
                                            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                ))}
            </div>


        </div>
    );
};

export default Service;

import React from 'react';
import { MapPin } from 'lucide-react';

const ContactSection: React.FC = () => {
    const [isMapHover, setIsMapHover] = React.useState(false);

    return (
        <section className="bg-white min-h-screen flex items-start pt-32 pb-24">
            {isMapHover && <style>{`#custom-cursor-main { opacity: 0; }`}</style>}
            <div className="w-full mx-auto px-6 md:px-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">

                    {/* Left Column: Info */}
                    <div className="lg:col-span-6 px-6 md:px-14 lg:px-24 flex flex-col pt-[112px] pb-24">
                        <div className="max-w-xl mx-auto w-full">
                            {/* Wrap title and info in a div to define the map's height boundary */}
                            <div className="flex flex-col">
                                <div className="w-[200%]">
                                    <h1 className="text-4xl md:text-5xl lg:text-[72px] font-poppins font-medium text-[#232A53] mb-[120px] tracking-normal leading-none whitespace-nowrap">
                                        Contact
                                    </h1>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[22px] font-bold text-[#232A53] mb-1">Address</h3>
                                        <p className="text-lg text-[#232A53] font-normal leading-relaxed whitespace-nowrap">서울 강남구 역삼로8길 15 2, 3층</p>
                                    </div>

                                    <div>
                                        <h3 className="text-[22px] font-bold text-[#232A53] mb-1">Email</h3>
                                        <p className="text-lg text-[#232A53] font-normal leading-relaxed">seoparchi@seoparchi.com</p>
                                    </div>

                                    <div>
                                        <h3 className="text-[22px] font-bold text-[#232A53] mb-1">Tel</h3>
                                        <p className="text-lg text-[#232A53] font-normal leading-relaxed">+82-2-6205-8688</p>
                                    </div>

                                    <div>
                                        <h3 className="text-[22px] font-bold text-[#232A53] mb-1">Fax</h3>
                                        <p className="text-lg text-[#232A53] font-normal leading-relaxed">+82-070-8708-9541</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Google Map */}
                    <div className="lg:col-span-6 flex flex-col pt-[112px] md:pr-[58px] lg:pr-[96px]">
                        <div
                            className="w-full relative overflow-hidden shadow-sm bg-gray-50 rounded-sm"
                            style={{ height: '535px', marginLeft: '-45%', width: '145%' }}
                            onMouseEnter={() => setIsMapHover(true)}
                            onMouseLeave={() => setIsMapHover(false)}
                        >
                            <iframe
                                src="https://maps.google.com/maps?q=서울+강남구+역삼로8길+15&t=&z=17&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{
                                    border: 0
                                }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;

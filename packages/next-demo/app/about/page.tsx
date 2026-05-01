import Image from "next/image";

const AboutSection = () => {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image Side */}
                    <div className="relative">
                        <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Team collaboration"
                                className="object-cover w-full h-full"
                                width={800}
                                height={500}
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-xl shadow-lg hidden sm:block">
                            <p className="text-3xl font-bold">10+</p>
                            <p className="text-sm opacity-90">Years Experience</p>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                                About Us
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                                We Build Digital Products That Matter
                            </h2>
                        </div>

                        <p className="text-gray-600 text-lg leading-relaxed">
                            We are a passionate team of designers, developers, and strategists dedicated to creating exceptional digital experiences. Our mission is to help businesses thrive in the digital age through innovative solutions.
                        </p>

                        <p className="text-gray-600 leading-relaxed">
                            With over a decade of experience, we've helped hundreds of companies transform their ideas into reality. We believe in the power of technology to solve real-world problems and create meaningful connections.
                        </p>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Innovation</h4>
                                    <p className="text-sm text-gray-500">Cutting-edge solutions</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Security</h4>
                                    <p className="text-sm text-gray-500">Enterprise-grade protection</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Performance</h4>
                                    <p className="text-sm text-gray-500">Lightning fast speed</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Support</h4>
                                    <p className="text-sm text-gray-500">24/7 dedicated help</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-4">
                            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg">
                                Learn More About Us
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;

import React from 'react';

import Card from '../components/Card';

import { BASE_CARD_LIST } from '../config/card';

const Home: React.FC = () => {

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <section className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to React Playground</h1>
                    <p className="text-lg text-gray-600 max-w-3xl">
                        A playground for exploring React features and best practices.
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BASE_CARD_LIST.map(card => (
                        <Card key={card.id} {...card} />
                    ))}
                </section>
            </main>
        </div>
    );
};

export default Home;

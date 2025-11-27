import React, { useState } from 'react';
import { ArrowLeft, Waves, Wind, ArrowRight } from 'lucide-react';
import logoIcon from 'figma:asset/f9a9dbdd1c474672b67f38c73c4e0df24e169dfd.png';

export default function App() {
  const [selectedOption, setSelectedOption] = useState<'washers' | 'dryers'>('washers');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2347b0]/5 via-white to-[#8eb6dc]/15">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center relative">
          <button className="absolute left-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#3B5998]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={logoIcon} alt="Soda Laundry" className="w-6 h-6" />
            </div>
            <span className="text-[#3B5998] font-semibold">Soda Laundry</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 pb-32">
        {/* Welcome Title */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900">Welcome!</h1>
        </div>

        {/* How Card Payment Works */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-gray-900 mb-6">How Card Payment Works</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3B5998] text-white flex items-center justify-center">
                1
              </div>
              <div className="flex-1 text-gray-700 pt-0.5">
                Select your washers or dryers
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3B5998] text-white flex items-center justify-center">
                2
              </div>
              <div className="flex-1 text-gray-700 pt-0.5">
                Choose your cycle and settings
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3B5998] text-white flex items-center justify-center">
                3
              </div>
              <div className="flex-1 text-gray-700 pt-0.5">
                Pay with your card or mobile wallet
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3B5998] text-white flex items-center justify-center">
                4
              </div>
              <div className="flex-1 text-gray-700 pt-0.5">
                Press START on your machine to begin
              </div>
            </div>
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-gray-50 rounded-2xl p-5 text-center mb-8">
          <div className="text-gray-900 mb-1">Need help?</div>
          <div className="text-gray-600">Our attendant is here to assist you!</div>
        </div>

        {/* Start Options */}
        <div className="space-y-4 mb-6">
          {/* Start Washers */}
          <button
            onClick={() => setSelectedOption('washers')}
            className={`w-full rounded-2xl p-5 flex items-center justify-between transition-all ${
              selectedOption === 'washers'
                ? 'bg-white border-3 border-[#3B5998] shadow-lg'
                : 'bg-white border-2 border-gray-200 hover:border-[#3B5998]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Waves className={`w-6 h-6 ${selectedOption === 'washers' ? 'text-[#3B5998]' : 'text-gray-700'}`} />
              <span className={`${selectedOption === 'washers' ? 'text-[#3B5998]' : 'text-gray-900'}`}>
                Start Washers
              </span>
            </div>
            <ArrowRight className={`w-5 h-5 ${selectedOption === 'washers' ? 'text-[#3B5998]' : 'text-gray-400'}`} />
          </button>

          {/* Start Dryers */}
          <button
            onClick={() => setSelectedOption('dryers')}
            className={`w-full rounded-2xl p-5 flex items-center justify-between transition-all ${
              selectedOption === 'dryers'
                ? 'bg-white border-3 border-orange-500 shadow-lg'
                : 'bg-white border-2 border-gray-200 hover:border-orange-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <Wind className={`w-6 h-6 ${selectedOption === 'dryers' ? 'text-orange-500' : 'text-gray-700'}`} />
              <span className={`${selectedOption === 'dryers' ? 'text-orange-500' : 'text-gray-900'}`}>
                Start Dryers
              </span>
            </div>
            <ArrowRight className={`w-5 h-5 ${selectedOption === 'dryers' ? 'text-orange-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Note */}
        <p className="text-gray-500 text-center">
          Note: Washers and dryers must be paid separately
        </p>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button 
            className={`w-full py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg text-white ${
              selectedOption === 'washers'
                ? 'bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] hover:from-[#1d3a8f] hover:to-[#7aa5cb]'
                : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

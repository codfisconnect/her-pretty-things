import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I choose the right hijab fabric for my needs?',
    answer:
      'For daily, fast, pin-free styling, our Egyptian Combed Jersey offers unmatched 4-way stretch. For formal events and light breathability, Malaysian High-Density Chiffon holds structural arches cleanly without slippage. If you seek hair health and luxury sheen, our Grade 6A Mulberry Silk protects strands with a non-slip matte back. For thermal warmth in cooler weather, our Cashmere Pashmina delivers regal comfort.'
  },
  {
    id: 'faq-2',
    question: 'Do Yusraa hijabs require pins and undercaps?',
    answer:
      'Our Egyptian Jersey and Modal hijabs can be worn completely pin-free with zero slippage. For our Malaysian Chiffon and Silk Satin pieces, we recommend our magnetic hijab pins, which secure the drape firmly without piercing or snagging delicate weave fibers.'
  },
  {
    id: 'faq-3',
    question: 'What are the dimensions of Yusraa hijabs?',
    answer:
      'Our standard hijabs measure approximately 180 cm x 75 cm (71 inches x 30 inches), providing full chest and shoulder coverage while allowing multiple drape folds. Our Maxi Pashminas measure an expansive 200 cm x 75 cm for extra layered modesty.'
  },
  {
    id: 'faq-4',
    question: 'How should I wash and care for my luxury hijabs?',
    answer:
      'For Chiffon and Jersey: gentle machine wash in a mesh laundry bag with mild detergent and hang to dry. For Mulberry Silk and Pashmina: gentle hand wash in lukewarm water with wool/silk cleanser, or professional dry clean. Never wring silk or pashmina fabrics; roll gently in a towel to remove excess moisture and dry flat in shade.'
  },
  {
    id: 'faq-5',
    question: 'What are your delivery and shipping timelines?',
    answer:
      'We offer complimentary express delivery across India on orders over ₹999. Standard domestic transit takes 2–4 business days. International express shipping to UAE, GCC, UK, and US takes 4–7 business days with full door-to-door tracking.'
  },
  {
    id: 'faq-6',
    question: 'What is your return and exchange policy?',
    answer:
      'We offer a 14-day hassle-free return and exchange window. If a color is not what you envisioned or you wish to switch fabrics, the hijab must remain unworn with original tags attached in its presentation box. See our Refund Policy page for full details.'
  }
];

export const FAQ: React.FC = () => {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-2']);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1 className="faq-title">Hijab Care &amp; Frequent Inquiries</h1>
        <p className="faq-subtitle">
          Everything you need to know about our luxury hijab fabrics, non-slip styling,
          maintenance, and order fulfillment.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div key={faq.id} className="faq-item-card">
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'open' : ''}`} />
              </button>
              {isOpen && (
                <div className="faq-answer-panel">
                  <p style={{ margin: 0 }}>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

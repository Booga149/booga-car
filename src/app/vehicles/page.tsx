"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import { Car } from 'lucide-react';

const makes = [
  { name: 'تويوتا (Toyota)', models: ['Yaris', 'Corolla', 'Camry', 'Avalon', 'Raize', 'Corolla Cross', 'RAV4', 'Fortuner', 'Prado', 'Land Cruiser', 'Hilux'] },
  { name: 'هيونداي (Hyundai)', models: ['Accent', 'Elantra', 'Sonata', 'Azera', 'Creta', 'Tucson', 'Santa Fe', 'Palisade'] },
  { name: 'كيا (Kia)', models: ['Rio', 'Pegas', 'Cerato', 'K5', 'Cadenza', 'Sportage', 'Sorento', 'Telluride', 'Carnival'] },
  { name: 'نيسان (Nissan)', models: ['Sunny', 'Sentra', 'Altima', 'Maxima', 'Kicks', 'X-Trail', 'Pathfinder', 'Patrol'] },
  { name: 'هوندا (Honda)', models: ['City', 'Civic', 'Accord', 'HR-V', 'CR-V', 'Pilot'] },
  { name: 'شيفروليه (Chevrolet)', models: ['Spark', 'Malibu', 'Camaro', 'Corvette', 'Captiva', 'Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Silverado'] },
  { name: 'فورد (Ford)', models: ['Taurus', 'Mustang', 'Escape', 'Edge', 'Explorer', 'Expedition', 'F-150', 'Bronco'] },
  { name: 'جي ام سي (GMC)', models: ['Terrain', 'Acadia', 'Yukon', 'Yukon XL', 'Sierra'] },
  { name: 'دودج (Dodge)', models: ['Charger', 'Challenger', 'Durango'] },
  { name: 'جيب (Jeep)', models: ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator'] },
  { name: 'مرسيدس (Mercedes-Benz)', models: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'G-Class', 'AMG GT'] },
  { name: 'بي ام دبليو (BMW)', models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6', 'X7'] },
  { name: 'أودي (Audi)', models: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'] },
  { name: 'لكزس (Lexus)', models: ['IS', 'ES', 'LS', 'NX', 'RX', 'GX', 'LX'] },
  { name: 'جينيسيس (Genesis)', models: ['G70', 'G80', 'G90', 'GV70', 'GV80'] },
  { name: 'فولفو (Volvo)', models: ['S60', 'S90', 'XC40', 'XC60', 'XC90'] },
  { name: 'كاديلاك (Cadillac)', models: ['CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade'] },
  { name: 'مازدا (Mazda)', models: ['Mazda 3', 'Mazda 6', 'CX-30', 'CX-5', 'CX-9'] },
  { name: 'ميتسوبيشي (Mitsubishi)', models: ['Attrage', 'Eclipse Cross', 'Outlander', 'Pajero', 'L200'] },
  { name: 'ام جي (MG)', models: ['MG 5', 'MG 6', 'MG GT', 'MG ZS', 'MG RX5', 'MG HS'] },
  { name: 'جيلي (Geely)', models: ['Coolray', 'Okavango', 'Azkarra', 'Tugella', 'Monjaro', 'Emgrand'] },
  { name: 'شيري (Chery)', models: ['Arrizo 5', 'Arrizo 6', 'Tiggo 3', 'Tiggo 7', 'Tiggo 8 Pro'] },
  { name: 'بورش (Porsche)', models: ['Macan', 'Cayenne', 'Panamera', 'Taycan', '911'] },
  { name: 'لاند روفر (Land Rover)', models: ['Evoque', 'Velar', 'Discovery', 'Range Rover Sport', 'Range Rover'] },
  { name: 'مازيراتي (Maserati)', models: ['Ghibli', 'Quattroporte', 'Levante'] },
  { name: 'بنتلي (Bentley)', models: ['Flying Spur', 'Continental GT', 'Bentayga'] },
  { name: 'لامبورجيني (Lamborghini)', models: ['Huracan', 'Aventador', 'Urus'] },
  { name: 'رولز رويس (Rolls-Royce)', models: ['Ghost', 'Wraith', 'Dawn', 'Phantom', 'Cullinan'] },
  { name: 'فيراري (Ferrari)', models: ['Roma', 'Portofino', 'F8 Tributo', 'SF90 Stradale', '812 Superfast', 'Purosangue'] },
];

export default function VehiclesPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem 4rem' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', direction: 'rtl', fontWeight: 600 }}>
          <a href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>الرئيسية</a>
          <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>/</span>
          <span style={{ color: 'var(--text-primary)' }}>ماركات السيارات</span>
        </div>

        {/* Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.5rem', 
              display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '-1px' 
            }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '12px', display: 'flex' }}>
                <Car size={32} />
              </div>
              ماركات السيارات
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>استكشف القطع المتوفرة لكل طراز وماركة.</p>
          </div>
          <div style={{ 
            fontSize: '1rem', color: 'var(--text-primary)', background: 'var(--surface)', 
            padding: '1rem 1.5rem', borderRadius: '16px', fontWeight: 800,
            border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)'
          }}>
            {makes.length} ماركة | <span style={{ color: 'var(--primary)' }}>{makes.reduce((t, m) => t + m.models.length, 0)} موديل</span>
          </div>
        </div>

        {/* Makes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}>
          {makes.map((make, i) => (
            <div
              key={i}
              className="glass-panel"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '2rem',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'var(--card-shadow)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(244, 63, 94, 0.15)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--card-shadow)';
              }}
            >
              <div style={{
                position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                background: 'linear-gradient(225deg, var(--primary) -100%, transparent 60%)', opacity: 0.05
              }}></div>

              {/* Make Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {make.name}
                </h3>
                <span style={{
                  fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(244, 63, 94, 0.1)',
                  padding: '0.4rem 0.8rem', borderRadius: '30px', fontWeight: 800,
                  border: '1px solid rgba(244, 63, 94, 0.1)'
                }}>
                  {make.models.length} موديل
                </span>
              </div>

              {/* Model Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {make.models.map(model => (
                  <a
                    key={model}
                    href={`/products?make=${encodeURIComponent(make.name)}&model=${encodeURIComponent(model)}`}
                    style={{
                      padding: '0.4rem 0.9rem',
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontWeight: 700,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'var(--background)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {model}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

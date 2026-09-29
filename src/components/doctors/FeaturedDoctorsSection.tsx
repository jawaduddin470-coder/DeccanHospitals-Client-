import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';
import { SectionLabel } from '../common/SectionLabel';
import { FeaturedDoctorCard } from './FeaturedDoctorCard';
import type { Doctor } from '../../types';

interface FeaturedDoctorsSectionProps {
  doctors: Doctor[];
  onSelectDoctor?: (doctor: Doctor) => void;
}

export const FeaturedDoctorsSection: React.FC<FeaturedDoctorsSectionProps> = ({
  doctors,
  onSelectDoctor,
}) => {
  if (doctors.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-[#D6EAF1]">
      <Container>
        <div className="max-w-3xl mb-12">
          <SectionLabel variant="blue" className="mb-3">
            LEAD CONSULTANTS
          </SectionLabel>
          <SectionHeading
            title="Featured Medical Team"
            subtitle="Senior consultants in obstetrics, gynaecology, pediatrics, and general medicine providing dedicated clinical guidance."
            titleSize="lg"
          />
        </div>

        {/* Responsive Grid: 3 cols on large screens, 2 cols on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <FeaturedDoctorCard doctor={doctor} onSelect={onSelectDoctor} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

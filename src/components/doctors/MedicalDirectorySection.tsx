import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';
import { SectionLabel } from '../common/SectionLabel';
import { DirectoryDoctorRow } from './DirectoryDoctorRow';
import type { Doctor } from '../../types';

interface MedicalDirectorySectionProps {
  doctors: Doctor[];
  onSelectDoctor?: (doctor: Doctor) => void;
}

export const MedicalDirectorySection: React.FC<MedicalDirectorySectionProps> = ({
  doctors,
  onSelectDoctor,
}) => {
  if (doctors.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-[#F7FCFE] border-b border-[#D6EAF1]">
      <Container>
        <div className="max-w-3xl mb-12">
          <SectionLabel variant="blue" className="mb-3">
            HOSPITAL DIRECTORY
          </SectionLabel>
          <SectionHeading
            title="Specialists &amp; Medical Directory"
            subtitle="Explore our broader directory of consulting surgeons, pediatricians, orthopaedicians, and general duty medical officers."
            titleSize="lg"
          />
        </div>

        {/* 2-Column Desktop Grid for Efficient Scanning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <DirectoryDoctorRow doctor={doctor} onSelect={onSelectDoctor} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

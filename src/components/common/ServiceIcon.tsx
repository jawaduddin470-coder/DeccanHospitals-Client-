import React from 'react';
import {
  Activity,
  Baby,
  HeartPulse,
  Stethoscope,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Smile,
  Radio,
  FlaskConical,
  Pill,
  Ambulance,
  ClipboardCheck,
  Bone,
  Ear,
  Layers,
} from 'lucide-react';

interface ServiceIconProps {
  name: string;
  className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Activity':
      return <Activity className={className} />;
    case 'Baby':
      return <Baby className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Bone':
      return <Bone className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Ear':
      return <Ear className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Pill':
      return <Pill className={className} />;
    case 'Ambulance':
      return <Ambulance className={className} />;
    case 'ClipboardCheck':
      return <ClipboardCheck className={className} />;
    default:
      return <Layers className={className} />;
  }
};

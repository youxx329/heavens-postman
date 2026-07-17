'use client';

import { useState } from 'react';

type Step = 'writing' | 'email' | 'sending' | 'done';

interface FormData {
  recipient: string;
  senderName: string;
  content: string;
  email: string;
}

export default function LetterForm() {
  const [step, setStep] = useState<Step>('writing');
  const [formData, setFormData] = useState<FormData>({
    recipient: '',
    senderName: '',
    content: '',
    email: '',
  });

  return <div></div>;
}

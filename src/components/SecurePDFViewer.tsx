import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface SecurePDFViewerProps {
  fileUrl: string;
}

export default function SecurePDFViewer({ fileUrl }: SecurePDFViewerProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [studentDetails, setStudentDetails] = useState({ name: 'Student', whatsapp: '' });

  useEffect(() => {
    // Fetch logged in student details for the watermark
    const fetchDetails = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', user?.id)
          .single();
        
        if (profile) {
          setStudentDetails({
            name: profile.full_name || 'Student',
            whatsapp: profile.phone_number || ''
          });
        }
      } catch (err) {
        console.error('Error fetching watermark details', err);
      }
    };
    if (user) fetchDetails();
  }, [user]);

  useEffect(() => {
    // Prevent print screen key combinations and context menu
    const preventCapture = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' || 
        (e.ctrlKey && e.key === 'p') || 
        (e.metaKey && e.key === 'p')
      ) {
        e.preventDefault();
        toast.error('Printing and downloading is disabled for this tute.');
      }
    };

    const preventMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', preventCapture);
    window.addEventListener('contextmenu', preventMenu);

    return () => {
      window.removeEventListener('keydown', preventCapture);
      window.removeEventListener('contextmenu', preventMenu);
    };
  }, []);

  useEffect(() => {
    if (!fileUrl) return;

    const renderMockDoc = () => {
      setLoading(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Mock PDF loading - in production, pdfjs-dist renders PDF to canvas
      // We will render a highly premium placeholder layout simulating the learning document
      canvas.width = 800;
      canvas.height = 1100;

      // Background Page
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 1100);

      // Header Brand
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(40, 40, 720, 4);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px system-ui';
      ctx.fillText('TutorX Premium Courseware', 40, 80);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui';
      ctx.fillText('Topic: Advanced Mechanics & Forces - Lecture Note 01', 40, 105);

      // Mock Text Content Lines
      ctx.fillStyle = '#334155';
      ctx.font = '15px system-ui';
      let y = 160;
      const lines = [
        '1. Introduction to Newtonian Kinematics',
        'Newton\'s laws of motion are three physical laws that, together, laid the foundation',
        'for classical mechanics. They describe the relationship between a body and the forces',
        'acting upon it, and its motion in response to those forces.',
        '',
        '2. Mathematical Formulation',
        'The second law states that the vector sum of the forces F on an object is equal to the',
        'mass m of that object multiplied by the acceleration vector a of the object: F = ma.',
        'This relationship determines the trajectory of any classical particle moving in 3D space.',
        '',
        '3. Practical Problems & Tutes',
        'Consider a block of mass m = 5kg resting on a frictionless inclined plane of angle θ = 30°.',
        'Calculate the net force accelerating the block down the incline. Assume g = 9.81 m/s².',
        'Solution: F_net = m * g * sin(θ) = 5 * 9.81 * 0.5 = 24.525 Newtons.'
      ];

      lines.forEach(line => {
        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
          ctx.font = 'bold 18px system-ui';
          ctx.fillStyle = '#0f172a';
          ctx.fillText(line, 40, y);
          y += 28;
        } else {
          ctx.font = '15px system-ui';
          ctx.fillStyle = '#334155';
          ctx.fillText(line, 40, y);
          y += 24;
        }
      });

      // RENDER SEAMLESS WATERMARK DYNAMICALLY OVER CONTENT
      ctx.save();
      ctx.translate(400, 550);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)'; // Safe subtle red watermark
      ctx.font = 'bold 36px system-ui';
      ctx.textAlign = 'center';
      
      const watermarkText = `SECURE TUTE - PROPERTY OF ${studentDetails.name.toUpperCase()}`;
      const whatsappText = `WHATSAPP: ${studentDetails.whatsapp || 'REGISTERED STUDENT'}`;
      const dateText = `ACCESSED ON: ${new Date().toLocaleDateString()}`;

      ctx.fillText(watermarkText, 0, -25);
      ctx.font = 'bold 28px system-ui';
      ctx.fillText(whatsappText, 0, 15);
      ctx.font = '18px system-ui';
      ctx.fillText(dateText, 0, 50);
      
      ctx.restore();
      
      setLoading(false);
    };

    renderMockDoc();
  }, [fileUrl, studentDetails]);

  return (
    <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900 p-4 flex flex-col items-center justify-center min-h-[400px]">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 text-xs text-slate-300 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur">
        <Shield className="h-3.5 w-3.5 text-success" />
        <span>Tute Guard Active</span>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-slate-400 text-sm">Decrypting Study Material...</span>
        </div>
      )}



      <div className="overflow-auto max-w-full shadow-2xl rounded border border-slate-800 bg-white">
        <canvas ref={canvasRef} className="max-w-full select-none pointer-events-none" />
      </div>
    </div>
  );
}

// Global supabase variable import fallback
import { supabase } from '@/lib/supabase';

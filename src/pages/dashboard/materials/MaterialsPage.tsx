import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, Search, FileText, Video, Folder, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ClassItem = {
  id: string;
  name: string;
  grade: string;
};

type MaterialItem = {
  id: string;
  class_id: string;
  title: string;
  type: string;
  file_url: string;
  created_at: string;
  classes?: { name: string; grade: string };
};

export default function MaterialsPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [classId, setClassId] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name, grade');
      
      if (classesError) throw classesError;
      setClasses(classesData || []);

      if (classesData && classesData.length > 0) {
        setClassId(classesData[0].id);
      }

      // Fetch materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select(`
          *,
          classes ( name, grade )
        `)
        .order('created_at', { ascending: false });

      if (materialsError) throw materialsError;
      setMaterials(materialsData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load materials data');
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      toast.error('Please select a class');
      return;
    }
    if (!title || !fileUrl) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('materials')
        .insert({
          class_id: classId,
          title,
          type,
          file_url: fileUrl
        });

      if (error) throw error;

      toast.success('Material uploaded successfully');
      setIsDialogOpen(false);
      setTitle('');
      setFileUrl('');
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload material');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-heading">Learning Materials</h2>
          <p className="text-sm text-paragraph">Upload PDFs, Tutes, and Class Recordings.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Material
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Material</DialogTitle>
              <DialogDescription>
                Select a class and upload a file or paste a recording link.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="class">Select Class</Label>
                <select 
                  id="class"
                  value={classId}
                  onChange={e => setClassId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  required
                >
                  <option value="" disabled>Select a class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.grade} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Material Title</Label>
                <Input 
                  id="title" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Week 1: Mechanics Tute" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select 
                  id="type"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <option value="pdf">PDF Document (External Link for now)</option>
                  <option value="video">Video Recording Link</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>File / Video Link URL</Label>
                <Input 
                  type="url" 
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Upload
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="h-5 w-5 text-paragraph" />
        <Input 
          placeholder="Search materials..." 
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-paragraph flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          Loading materials...
        </div>
      ) : materials.length === 0 ? (
        <div className="p-8 text-center text-paragraph border border-border rounded-xl bg-card">
          <FileText className="mx-auto h-12 w-12 text-muted mb-4" />
          <p>No materials uploaded yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map(material => (
            <div key={material.id} className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.open(material.file_url, '_blank')}>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${material.type === 'video' ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'}`}>
                {material.type === 'video' ? <Video className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              </div>
              <h3 className="font-bold text-heading truncate w-full">{material.title}</h3>
              <p className="text-xs text-paragraph mt-1">{material.classes?.grade} - {material.classes?.name}</p>
              <div className="mt-4 w-full flex justify-between text-xs text-paragraph border-t border-border pt-4">
                <span className="capitalize">{material.type}</span>
                <span>External</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
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
import { Upload, Search, FileText, Video, Folder } from 'lucide-react';

export default function MaterialsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            <form className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Material Title</Label>
                <Input id="title" placeholder="e.g. Week 1: Mechanics Tute" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <option value="pdf">PDF Document</option>
                  <option value="recording">Video Recording Link</option>
                  <option value="pack">Lesson Pack</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>File / Link</Label>
                <Input type="file" className="cursor-pointer" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => setIsDialogOpen(false)}>Upload</Button>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mock Data Cards */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-heading">Mechanics Tute 01</h3>
          <p className="text-xs text-paragraph mt-1">2025 A/L Physics</p>
          <div className="mt-4 w-full flex justify-between text-xs text-paragraph border-t border-border pt-4">
            <span>PDF Document</span>
            <span>2.4 MB</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Video className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-heading">Week 1 Live Recording</h3>
          <p className="text-xs text-paragraph mt-1">2025 A/L Physics</p>
          <div className="mt-4 w-full flex justify-between text-xs text-paragraph border-t border-border pt-4">
            <span>Video Link</span>
            <span>External</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-4">
            <Folder className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-heading">Thermodynamics Pack</h3>
          <p className="text-xs text-paragraph mt-1">2024 O/L Science</p>
          <div className="mt-4 w-full flex justify-between text-xs text-paragraph border-t border-border pt-4">
            <span>Lesson Pack</span>
            <span>3 Files</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Link as LinkIcon, User, Image, Building, CreditCard, FileText, MessageCircle, LayoutTemplate } from 'lucide-react';

interface ProfileData {
  full_name: string;
  avatar_url: string;
}

interface CustomPageSettings {
  bank_details: {
    account_name: string;
    account_number: string;
    bank_name: string;
    branch_name: string;
  };
  heading: string;
  photos: string[];
  result_sheet_image: string;
  whatsapp_number: string;
  facebook_link: string;
}

interface TeacherData {
  institute_name: string;
  subdomain: string;
  custom_page_settings: CustomPageSettings;
}

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<ProfileData>({ full_name: '', avatar_url: '' });
  const [teacher, setTeacher] = useState<TeacherData>({ 
    institute_name: '', 
    subdomain: '',
    custom_page_settings: {
      bank_details: { account_name: '', account_number: '', bank_name: '', branch_name: '' },
      heading: 'Master Your Subjects - Now At Your Fingertips!',
      photos: ['', '', ''],
      result_sheet_image: '',
      whatsapp_number: '',
      facebook_link: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || '',
            avatar_url: profileData.avatar_url || ''
          });
          setIsTeacher(profileData.role === 'TEACHER');
        }

        // Fetch teacher data if teacher
        if (profileData?.role === 'TEACHER') {
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('institute_name, subdomain, custom_page_settings')
            .eq('profile_id', user.id)
            .single();
            
          if (teacherData) {
            setTeacher({
              institute_name: teacherData.institute_name || '',
              subdomain: teacherData.subdomain || '',
              custom_page_settings: teacherData.custom_page_settings || {
                bank_details: { account_name: '', account_number: '', bank_name: '', branch_name: '' },
                heading: 'Master Your Subjects - Now At Your Fingertips!',
                photos: ['', '', ''],
                result_sheet_image: '',
                whatsapp_number: '',
                facebook_link: ''
              }
            });
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      // 2. Update Teacher Data (if applicable)
      if (isTeacher) {
        // Simple client side formatting for subdomain slug
        const formattedSubdomain = teacher.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
        
        const { error: teacherError } = await supabase
          .from('teachers')
          .update({
            institute_name: teacher.institute_name,
            subdomain: formattedSubdomain,
            custom_page_settings: teacher.custom_page_settings
          })
          .eq('profile_id', user.id);
          
        if (teacherError) {
          if (teacherError.code === '23505') {
             throw new Error('This unique link is already taken by another teacher. Please choose a different one.');
          }
          throw teacherError;
        }
        
        // Update local state to reflect formatting
        setTeacher(prev => ({ ...prev, subdomain: formattedSubdomain }));
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while saving.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-heading">Settings</h1>
        <p className="text-paragraph">Manage your public profile and platform preferences.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading">Public Profile settings</h2>
              <p className="text-sm text-paragraph">This information will be displayed publicly on your custom landing page.</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {message.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-paragraph" />
                  Your Name
                </Label>
                <Input 
                  id="fullName" 
                  value={profile.full_name} 
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-paragraph" />
                  Avatar Image URL
                </Label>
                <Input 
                  id="avatarUrl" 
                  value={profile.avatar_url} 
                  onChange={(e) => setProfile({...profile, avatar_url: e.target.value})} 
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-paragraph">Paste a link to an image to use as your profile picture.</p>
              </div>
            </div>

            {/* Teacher Details */}
            {isTeacher && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instituteName" className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-paragraph" />
                    Institute / Class Name
                  </Label>
                  <Input 
                    id="instituteName" 
                    value={teacher.institute_name} 
                    onChange={(e) => setTeacher({...teacher, institute_name: e.target.value})} 
                    placeholder="e.g. Success Academy"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-paragraph" />
                    Public Link (Subdomain)
                  </Label>
                  <div className="flex relative">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-slate-100 text-slate-500 text-sm">
                      tutorx.com/
                    </span>
                    <Input 
                      id="subdomain" 
                      className="rounded-l-none"
                      value={teacher.subdomain} 
                      onChange={(e) => setTeacher({...teacher, subdomain: e.target.value})} 
                      placeholder="e.g. johndoe"
                      required
                    />
                  </div>
                  <p className="text-xs text-paragraph">This creates your custom URL (e.g., tutorx.com/yourname) where students can find your profile and login.</p>
                </div>
              </div>
            )}
          </div>

          {/* Teacher Specific Settings (Bank & Profile Customization) */}
          {isTeacher && (
            <>
              {/* Bank Details */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-bold text-heading flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Bank Details (For Student Payments)
                </h3>
                <div className="grid md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input 
                      value={teacher.custom_page_settings.bank_details.account_name} 
                      onChange={(e) => setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, bank_details: {...teacher.custom_page_settings.bank_details, account_name: e.target.value}}})} 
                      placeholder="e.g. A. B. Perera"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input 
                      value={teacher.custom_page_settings.bank_details.account_number} 
                      onChange={(e) => setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, bank_details: {...teacher.custom_page_settings.bank_details, account_number: e.target.value}}})} 
                      placeholder="e.g. 1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input 
                      value={teacher.custom_page_settings.bank_details.bank_name} 
                      onChange={(e) => setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, bank_details: {...teacher.custom_page_settings.bank_details, bank_name: e.target.value}}})} 
                      placeholder="e.g. Commercial Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input 
                      value={teacher.custom_page_settings.bank_details.branch_name} 
                      onChange={(e) => setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, bank_details: {...teacher.custom_page_settings.bank_details, branch_name: e.target.value}}})} 
                      placeholder="e.g. Colombo 01"
                    />
                  </div>
                </div>
              </div>

              {/* Public Page Customization */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-bold text-heading flex items-center gap-2 mb-4">
                  <LayoutTemplate className="h-5 w-5 text-primary" />
                  Public Landing Page Customization
                </h3>
                <div className="space-y-6 bg-slate-50/50 p-4 sm:p-6 rounded-xl border border-slate-100">
                  
                  <div className="space-y-2">
                    <Label>Main Heading</Label>
                    <Input 
                      value={teacher.custom_page_settings.heading} 
                      onChange={(e) => setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, heading: e.target.value}})} 
                      placeholder="e.g. Master Your Subjects - Now At Your Fingertips!"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hero Photos (Image URLs)</Label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[0, 1, 2].map(index => (
                        <Input 
                          key={index}
                          value={teacher.custom_page_settings.photos[index]} 
                          onChange={(e) => {
                            const newPhotos = [...teacher.custom_page_settings.photos];
                            newPhotos[index] = e.target.value;
                            setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, photos: newPhotos}});
                          }} 
                          placeholder={`Photo ${index + 1} URL`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Result Sheet Image URL
                    </Label>
                    <Input 
                      value={teacher.custom_page_settings.result_sheet_image} 
                      onChange={(e) => setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, result_sheet_image: e.target.value}})} 
                      placeholder="e.g. https://example.com/results.jpg"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp Number
                      </Label>
                      <Input 
                        value={teacher.custom_page_settings.whatsapp_number} 
                        onChange={(e) => setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, whatsapp_number: e.target.value}})} 
                        placeholder="e.g. 940771234567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-blue-500" /> Facebook Link
                      </Label>
                      <Input 
                        value={teacher.custom_page_settings.facebook_link} 
                        onChange={(e) => setTeacher({...teacher, custom_page_settings: {...teacher.custom_page_settings, facebook_link: e.target.value}})} 
                        placeholder="e.g. https://facebook.com/yourpage"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          <div className="pt-6 border-t border-border flex justify-end">
            <Button type="submit" disabled={saving} className="min-w-[120px]">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

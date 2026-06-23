export type Task = {
  id: string;
  title: string;
  course: string;
  description: string;
  deadline: string;
  requiresSubmission: boolean;
  status: 'pending' | 'submitted' | 'overdue';
  imageUrl?: string;
  attachmentUrl?: string;
  submissionUrl?: string;
  submittedLink?: string;
  submittedFile?: string;
  completedBy?: string[];
  imageFile?: File;
  pdfFile?: File;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'low' | 'normal' | 'high';
  imageUrl?: string;
  attachmentUrl?: string;
  imageFile?: File;
  pdfFile?: File;
};

export type Material = {
  id: string;
  title: string;
  course: string;
  url: string;
  dateAdded: string;
  type: 'pdf' | 'video' | 'link';
  imageUrl?: string;
  attachmentUrl?: string;
  imageFile?: File;
  pdfFile?: File;
};

export type User = {
  id: string;
  name: string;
  nim: string;
  role: 'mahasiswa' | 'komti';
  email: string;
};

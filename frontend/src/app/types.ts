export type Task = {
  id: string;
  title: string;
  course: string;
  description: string;
  deadline: string;
  requiresSubmission: boolean;
  status: 'pending' | 'submitted' | 'overdue';
  imageUrl?: string;
  attachmentUrl?: string; // Komti's attached PDF or file
  submissionUrl?: string; // Link provided by Komti to collect tasks (e.g., GDrive Folder)
  submittedLink?: string; // Mahasiswa's submitted link (Legacy)
  submittedFile?: string; // Mahasiswa's submitted file name (Legacy)
  completedBy?: string[]; // Arrays of UUIDs of users who completed it
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'low' | 'normal' | 'high';
  imageUrl?: string;
  attachmentUrl?: string; // Uploaded PDF
};

export type Material = {
  id: string;
  title: string;
  course: string;
  url: string;
  dateAdded: string;
  type: 'pdf' | 'video' | 'link';
  imageUrl?: string;
  attachmentUrl?: string; // Uploaded PDF
};

export type User = {
  id: string;
  name: string;
  nim: string;
  role: 'mahasiswa' | 'komti';
  email: string;
};

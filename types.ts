
export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  imageUrl: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  location: string;
  status: 'In Progress' | 'Completed' | 'Planning';
  progress: number;
  type: 'Road' | 'Bridge' | 'Building' | 'Water';
  imageUrl: string;
}

export interface InfraStats {
  name: string;
  value: number;
}

export interface RoadReport {
  id?: string;
  lokasi_jalan: string;
  latitude: string;
  longitude: string;
  deskripsi: string;
  image_url: string;
  jurisdiction: string;
  timestamp: string;
  source: string;
  status?: 'Baru' | 'Diproses' | 'Selesai' | 'Diteruskan';
}

export type GalleryPhoto = {
  id: string;
  uri: string;
  width: number;
  height: number;
};

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: '1015', uri: 'https://picsum.photos/id/1015/400/300', width: 400, height: 300 },
  { id: '1016', uri: 'https://picsum.photos/id/1016/400/500', width: 400, height: 500 },
  { id: '1018', uri: 'https://picsum.photos/id/1018/400/300', width: 400, height: 300 },
  { id: '1019', uri: 'https://picsum.photos/id/1019/400/400', width: 400, height: 400 },
  { id: '1021', uri: 'https://picsum.photos/id/1021/400/300', width: 400, height: 300 },
  { id: '1024', uri: 'https://picsum.photos/id/1024/400/500', width: 400, height: 500 },
  { id: 'broken', uri: 'https://this-host-does-not-exist.invalid/photo.jpg', width: 400, height: 300 },
];

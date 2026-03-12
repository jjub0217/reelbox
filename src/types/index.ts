export type ReelWithRelations = {
  id: string;
  url: string;
  thumbnail: string | null;
  memo: string | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  tags: { tag: { id: string; name: string } }[];
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryOption = {
  id: string;
  name: string;
};

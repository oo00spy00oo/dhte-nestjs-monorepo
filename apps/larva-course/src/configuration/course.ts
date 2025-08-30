import { LarvaCourseServiceCourseStatus } from '../core/types';

export const larvaCourseServiceSubjects = [
  {
    id: '1',
    name: 'Tiếng Anh',
    code: 'ENGLISH',
    imageUrl: 'https://pub-2ce0a20e043b42e8a0528b30b9d6d85b.r2.dev/eng-icon.webp',
    status: LarvaCourseServiceCourseStatus.Active,
    skills: [
      {
        id: '1',
        name: 'Luyện nói',
        imageUrl: '',
        status: LarvaCourseServiceCourseStatus.Active,
        code: 'ENGLISH_SPEAKING',
        categories: [
          {
            id: '1',
            name: 'Luyện từ vựng theo chủ đề',
            status: LarvaCourseServiceCourseStatus.Active,
            code: 'ENGLISH_SPEAKING_WORD',
          },
          {
            id: '2',
            name: 'Luyện câu theo chủ đề',
            status: LarvaCourseServiceCourseStatus.Active,
            code: 'ENGLISH_SPEAKING_SENTENCE',
          },
          {
            id: '3',
            name: 'Nhập vai theo chủ đề',
            status: LarvaCourseServiceCourseStatus.Active,
            code: 'ENGLISH_SPEAKING_ROLEPLAY',
          },
        ],
      },
      {
        id: '2',
        name: 'Luyện nghe',
        imageUrl: '',
        status: LarvaCourseServiceCourseStatus.Active,
        code: 'ENGLISH_LISTENING',
      },
      {
        id: '3',
        name: 'Luyện đọc',
        imageUrl: '',
        status: LarvaCourseServiceCourseStatus.Active,
        code: 'ENGLISH_READING',
      },
      {
        id: '4',
        name: 'Luyện viết',
        imageUrl: '',
        status: LarvaCourseServiceCourseStatus.Active,
        code: 'ENGLISH_WRITING',
      },
      {
        id: '5',
        name: 'Luyện từ vựng',
        imageUrl: '',
        status: LarvaCourseServiceCourseStatus.Active,
        code: 'ENGLISH_VOCABULARY',
      },
    ],
  },
];

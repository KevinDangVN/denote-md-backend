import Mux, { IRequestData } from '../framework/mux';
import { IResponseList } from '../framework/response';
import { IComment, ModelComment } from '../model/comment';
import { CommentValidator, UuidValidator } from '../validators';

// Get all comments at root level in article for a given article's UUID
Mux.get<[IComment]>(
  '/v1/comment/article/:articleUuid',
  UuidValidator,
  async (requestData: IRequestData): Promise<IResponseList<[IComment]>> => {
    const offset = requestData.body.offset > 1 ? requestData.body.offset - 1 : 0;
    const limit = requestData.body.limit ? requestData.body.limit : 10;
    const order = requestData.body.order ? requestData.body.order : [{ column: 'updated', order: 'asc' }];

    const foundComments = (await ModelComment.find({ articleId: requestData.params.uuid })
      .sort({ ...order })
      .limit(limit)
      .skip(offset * limit)
      .lean()) as [IComment];

    const totalComments = await ModelComment.find({ articleId: requestData.params.uuid }).countDocuments();

    if (foundComments.length > 0) {
      return {
        success: true,
        result: {
          total: totalComments,
          limit,
          offset,
          order,
          records: [foundComments],
        },
      };
    }

    throw new Error("Can't find comment");
  },
);

// Get all comments that's reply to a given comment UUID
Mux.get<[IComment]>('/v1/comment/comment/:commentUuid', UuidValidator, async (): Promise<any> => {});

// Add a comment at root level in an article base on article's uuid
Mux.post<IComment>('/v1/comment/article/:articleUuid', CommentValidator, async (): Promise<any> => {});

// Reply to a comment in an article base on article's uuid
Mux.post<IComment>('/v1/comment/:commentUuid/article/:articleUuid', CommentValidator, async (): Promise<any> => {});

// Edit comment in article
Mux.put<IComment>('/v1/comment/:commentUuid', CommentValidator, async (): Promise<any> => {});

// Delete a comment
Mux.delete<IComment>('/v1/comment/:commentUuid', UuidValidator, async (): Promise<any> => {});

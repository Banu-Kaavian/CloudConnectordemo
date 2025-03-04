using { upload as db } from '../db/schema';

service UploadService {
    entity Files as projection on db.Files;
}

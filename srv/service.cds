using { smetadata as external } from '../srv/external/smetadata';

service CatalogService {
    entity Programs as projection on external.Programs {
        key ProgramName, 
        key Author        
    };
}

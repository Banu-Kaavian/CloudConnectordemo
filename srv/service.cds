using { ODataService as external } from './external/metadata';

service CatalogService {
    entity Programs as projection on external.Programs;
}


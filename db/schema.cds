namespace ODataService;

entity CatalogService {
    key ID: UUID;
    name: String;
    description: String;
}

entity EntityMetadata {
    key ID : UUID;
    serviceName : String;
    metadata : String;
}

entity DataEntity {
    key ID: UUID;
    data: String;
}

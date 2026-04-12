"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateParticipantDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const create_participant_dto_1 = require("./create-participant.dto");
class UpdateParticipantDto extends (0, swagger_1.PartialType)(create_participant_dto_1.CreateParticipantDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateParticipantDto = UpdateParticipantDto;
//# sourceMappingURL=update-participant.dto.js.map
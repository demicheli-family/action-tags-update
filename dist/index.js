"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Read inputs
            const token = core.getInput('token', { required: true });
            const filePath = core.getInput('file', { required: true });
            const inputNameTags = core.getInput('input_name_tags') || 'tags';
            // Create GitHub client
            const octokit = github.getOctokit(token);
            const { owner, repo } = github.context.repo;
            // Fetch the latest 10 tags
            const { data: tags } = yield octokit.rest.repos.listTags({
                owner,
                repo,
                per_page: 10
            });
            const tagNames = tags.map(tag => tag.name);
            // Check if the file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            // Read and parse the existing YAML file
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const yamlData = (yaml.load(fileContent) || {});
            // Ensure the structure exists for `on -> workflow_dispatch -> inputs -> [inputNameTags]`
            yamlData.on = yamlData.on || {};
            yamlData.on.workflow_dispatch = yamlData.on.workflow_dispatch || { inputs: {} };
            yamlData.on.workflow_dispatch.inputs = yamlData.on.workflow_dispatch.inputs || {};
            (_b = (_a = yamlData.on) === null || _a === void 0 ? void 0 : _a.workflow_dispatch) === null || _b === void 0 ? void 0 : _b.inputs;
            yamlData.on.workflow_dispatch.inputs[inputNameTags].options = tagNames;
            // Write the updated YAML back to the file
            const updatedYaml = yaml.dump(yamlData, { noRefs: true });
            fs.writeFileSync(filePath, updatedYaml, 'utf8');
            core.info(`Successfully updated ${filePath} with the latest tags.`);
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
            else {
                core.setFailed('An unknown error occurred.');
            }
        }
    });
}
run();

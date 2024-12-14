import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { WorkflowYaml } from './configFile/interfaces';

async function run() {
  try {
    // Read inputs
    const token = core.getInput('token', { required: true });
    const filePath = core.getInput('file', { required: true });
    const inputNameTags = core.getInput('input_name_tags') || 'tags';

    // Create GitHub client
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    // Fetch the latest 10 tags
    const { data: tags } = await octokit.rest.repos.listTags({
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
    const yamlData = (yaml.load(fileContent) || {}) as WorkflowYaml;

    // Ensure the structure exists for `on -> workflow_dispatch -> inputs -> [inputNameTags]`
    yamlData.on = yamlData.on || {};
    yamlData.on.workflow_dispatch = yamlData.on.workflow_dispatch || { inputs: {} };
    yamlData.on.workflow_dispatch.inputs = yamlData.on.workflow_dispatch.inputs || {};
    yamlData.on?.workflow_dispatch?.inputs;
    yamlData.on.workflow_dispatch.inputs[inputNameTags].options = tagNames;

    // Write the updated YAML back to the file
    const updatedYaml = yaml.dump(yamlData, { noRefs: true });
    fs.writeFileSync(filePath, updatedYaml, 'utf8');

    core.info(`Successfully updated ${filePath} with the latest tags.`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred.');
    }
  }
}

run();

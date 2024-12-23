import * as core from '@actions/core';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { WorkflowYaml } from './configFile/interfaces';
import simpleGit, { SimpleGit, SimpleGitFactory, TagResult } from 'simple-git';

async function run() {
  try {
    // Read inputs
    const filePath = core.getInput('file', { required: true });
    const inputNameTags = core.getInput('input_name_tags') || 'tags';
    const git: SimpleGit = simpleGit();
    const tags: TagResult = await git.tags();

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const yamlData = (yaml.load(fileContent) || {}) as WorkflowYaml;

    yamlData.on = yamlData.on || {};
    yamlData.on.workflow_dispatch = yamlData.on.workflow_dispatch || { inputs: {} };
    yamlData.on.workflow_dispatch.inputs = yamlData.on.workflow_dispatch.inputs || {};
    yamlData.on?.workflow_dispatch?.inputs;
    yamlData.on.workflow_dispatch.inputs[inputNameTags].options = tags.all.slice(-10);

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

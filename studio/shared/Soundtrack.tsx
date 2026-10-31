import React from 'react';
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';

/** Use a built local mix. Missing sound should fail visibly instead of disappearing. */
export const Soundtrack: React.FC<{project: string; voiceover?: boolean}> = ({project, voiceover=false}) => voiceover ? <>
  <Audio src={staticFile(`generated/${project}/bed.wav`)}/>
  <Audio src={staticFile(`generated/${project}/voice.wav`)}/>
</> : <Audio src={staticFile(`generated/${project}/mix.wav`)}/>;

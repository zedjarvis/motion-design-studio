import React from 'react';
import {CursorProbe,CursorSeekTest} from '../projects/cursor-lab/src/Video';
import {AbsoluteFill, Composition, useCurrentFrame} from 'remotion';
import {AlconostLocalization} from '../projects/alconost-localization/src/Video';
import {CreatorsStudio} from '../projects/creators-studio/src/Video';
import {MinimalistPriceless} from '../projects/minimalist-priceless/src/Video';
import {GlassyPhone} from '../projects/glassy-phone/src/Video';
import {HaftStudioLaunch} from '../projects/haft-studio-launch/src/Video';
import {SchoolbooksLaunch} from '../projects/schoolbooks-launch/src/Video';
import {GraphicsCapabilities,GraphicsSeekTest} from '../projects/graphics-lab/src/Video';
import {SchoolbooksProductBrag} from '../projects/schoolbooks-product-brag/src/Video';
import {SchoolbooksFeatureGuide} from '../projects/schoolbooks-feature-guide/src/Video';
import {SchoolbooksFeeFollowupSocial} from '../projects/schoolbooks-fee-followup-social/src/Video';

const EngineCheck: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#101010', color: 'white', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif'}}>
    <div style={{fontSize: 60}}>Motion design studio</div>
    <div style={{fontSize: 24, marginTop: 30}}>Deterministic frame {frame}</div>
  </AbsoluteFill>;
};

export const StudioRoot: React.FC = () => <>
  <Composition id="CursorProbe" component={CursorProbe} width={1280} height={720} fps={30} durationInFrames={75}/>
  <Composition id="CursorSeekTest" component={CursorSeekTest} width={1280} height={720} fps={30} durationInFrames={75}/>
  <Composition id="EngineCheck" component={EngineCheck} width={1080} height={1920} fps={30} durationInFrames={60}/>
  <Composition id="AlconostLocalization" component={AlconostLocalization} width={1080} height={1920} fps={25} durationInFrames={490}/>
  <Composition id="CreatorsStudio" component={CreatorsStudio} width={556} height={314} fps={48} durationInFrames={522}/>
  <Composition id="MinimalistPriceless" component={MinimalistPriceless} width={1080} height={1920} fps={60} durationInFrames={535}/>
  <Composition id="GlassyPhone" component={GlassyPhone} width={888} height={1920} fps={24} durationInFrames={364}/>
  <Composition id="HaftStudioLaunch" component={HaftStudioLaunch} width={1920} height={1080} fps={30} durationInFrames={450}/>
  <Composition id="SchoolbooksLaunch" component={SchoolbooksLaunch} width={1920} height={1080} fps={30} durationInFrames={690}/>
  <Composition id="GraphicsCapabilities" component={GraphicsCapabilities} width={1200} height={720} fps={30} durationInFrames={90}/>
  <Composition id="GraphicsSeekTest" component={GraphicsSeekTest} width={1200} height={720} fps={30} durationInFrames={90}/>
  <Composition id="SchoolbooksProductBrag" component={SchoolbooksProductBrag} width={1920} height={1080} fps={30} durationInFrames={540}/>
  <Composition id="SchoolbooksFeatureGuide" component={SchoolbooksFeatureGuide} width={1920} height={1080} fps={30} durationInFrames={720}/>
  <Composition id="SchoolbooksFeeFollowupSocial" component={SchoolbooksFeeFollowupSocial} width={1080} height={1920} fps={30} durationInFrames={450}/>
</>;

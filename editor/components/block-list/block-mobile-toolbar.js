/**
 * WordPress dependencies
 */
import { ifViewportMatches } from '@wordpress/viewport';

/**
 * Internal dependencies
 */
import BlockMover from '../block-mover';
import BlockRemoveButton from '../block-settings-menu/block-remove-button';
import BlockSettingsMenu from '../block-settings-menu';
import VisualEditorInserter from '../inserter';

function BlockMobileToolbar( { rootUID, uid, renderBlockMenu } ) {
	return (
		<div className="editor-block-list__block-mobile-toolbar">
			<VisualEditorInserter />
			<BlockMover uids={ [ uid ] } />
			<BlockRemoveButton uids={ [ uid ] } small />
			<BlockSettingsMenu rootUID={ rootUID } uids={ [ uid ] } renderBlockMenu={ renderBlockMenu } />
		</div>
	);
}

export default ifViewportMatches( '< small' )( BlockMobileToolbar );

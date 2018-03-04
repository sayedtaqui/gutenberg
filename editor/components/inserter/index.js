/**
 * External dependencies
 */
import { get, intersection, isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Dropdown, IconButton, withContext } from '@wordpress/components';
import { createBlock, isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { Component, compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import InserterMenu from './menu';

class Inserter extends Component {
	constructor() {
		super( ...arguments );

		this.onToggle = this.onToggle.bind( this );
	}

	onToggle( isOpen ) {
		const { onToggle } = this.props;

		if ( isOpen ) {
			this.props.showInsertionPoint();
		} else {
			this.props.hideInsertionPoint();
		}

		// Surface toggle callback to parent component
		if ( onToggle ) {
			onToggle( isOpen );
		}
	}

	render() {
		const {
			position,
			title,
			children,
			onInsertBlock,
			hasSupportedBlocks,
			isLocked,
			supportedBlockTypes,
		} = this.props;

		if ( ! hasSupportedBlocks || isLocked ) {
			return null;
		}

		return (
			<Dropdown
				className="editor-inserter"
				position={ position }
				onToggle={ this.onToggle }
				expandOnMobile
				headerTitle={ title }
				renderToggle={ ( { onToggle, isOpen } ) => (
					<IconButton
						icon="insert"
						label={ __( 'Add block' ) }
						onClick={ onToggle }
						className="editor-inserter__toggle"
						aria-haspopup="true"
						aria-expanded={ isOpen }
					>
						{ children }
					</IconButton>
				) }
				renderContent={ ( { onClose } ) => {
					const onSelect = ( item ) => {
						onInsertBlock( item );

						onClose();
					};

					return <InserterMenu onSelect={ onSelect } supportedBlockTypes={ supportedBlockTypes } />;
				} }
			/>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const insertionPoint = select( 'core/editor' ).getBlockInsertionPoint();
		const { rootUID } = insertionPoint;
		const blockListSettings = select( 'core/editor' ).getBlockListSettings( rootUID );
		return {
			title: select( 'core/editor' ).getEditedPostAttribute( 'title' ),
			insertionPoint,
			selectedBlock: select( 'core/editor' ).getSelectedBlock(),
			supportedBlocks: get( blockListSettings, 'supportedBlocks' ),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => ( {
		showInsertionPoint: dispatch( 'core/editor' ).showInsertionPoint,
		hideInsertionPoint: dispatch( 'core/editor' ).hideInsertionPoint,
		onInsertBlock: ( item ) => {
			const { insertionPoint, selectedBlock } = ownProps;
			const { index, rootUID, layout } = insertionPoint;
			const { name, initialAttributes } = item;
			const insertedBlock = createBlock( name, { ...initialAttributes, layout } );
			if ( selectedBlock && isUnmodifiedDefaultBlock( selectedBlock ) ) {
				return dispatch( 'core/editor' ).replaceBlocks( selectedBlock.uid, insertedBlock );
			}
			return dispatch( 'core/editor' ).insertBlock( insertedBlock, index, rootUID );
		},
	} ) ),
	withContext( 'editor' )( ( settings, props ) => {
		const { blockTypes, templateLock } = settings;
		let supportedBlockTypes;
		if ( ! props.supportedBlocks ) {
			supportedBlockTypes = blockTypes;
		} else if ( true === blockTypes ) {
			supportedBlockTypes = props.supportedBlocks;
		} else {
			supportedBlockTypes = intersection( blockTypes, props.supportedBlocks );
		}
		return {
			hasSupportedBlocks: ( true === supportedBlockTypes ) || ! isEmpty( supportedBlockTypes ),
			supportedBlockTypes,
			isLocked: !! templateLock,
		};
	} ),
] )( Inserter );

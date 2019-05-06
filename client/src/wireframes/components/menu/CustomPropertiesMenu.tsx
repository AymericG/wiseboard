import { Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    ColorConfigurable,
    Configurable,
    DiagramVisual,
    EditorStateInStore,
    getDiagramId,
    getSelectedConfigurables,
    getSelectedShape,
    NumberConfigurable,
    selectColorTab,
    SelectionConfigurable,
    SliderConfigurable,
    UIStateInStore
} from '@app/wireframes/model';

import { NumberPicker } from '@app/core/react/NumberPicker';
import { SelectPicker } from '@app/core/react/SelectPicker';

interface CustomPropertiesMenuProps {
    // The selected diagram.
    selectedDiagramId: string | null;

    // The selected items.
    selectedShape: DiagramVisual | null;

    // The configurable properties.
    selectedConfigurables: Configurable[];

    // The selected color tab.
    selectedColorTab: string;

    // Change the items appearance..
    changeItemsAppearance: (diagram: string, visuals: DiagramVisual[], key: string, val: any) => any;

    // Selectes the color tab.
    selectColorTab: (key: string) => any;
}

const CustomPropertiesMenu = (props: CustomPropertiesMenuProps) => {
    const { selectedColorTab, selectedConfigurables, selectedDiagramId, selectedShape } = props;

    return selectedShape && selectedDiagramId ? (
        <>
            {selectedDiagramId && selectedConfigurables.map(c =>
                <Tooltip title={c.label} key={c.name}>
                    {c instanceof SliderConfigurable &&
                        <NumberPicker
                            className='menu-item'
                            asSlider={true}
                            value={selectedShape.appearance.get(c.name)}
                            min={c.min}
                            max={c.max}
                            onChange={(value: number) => props.changeItemsAppearance(selectedDiagramId, [selectedShape], c.name, value)} />
                    }
                    {c instanceof NumberConfigurable &&
                        <NumberPicker
                            className='menu-item'
                            value={selectedShape.appearance.get(c.name)}
                            min={c.min}
                            max={c.max}
                            onChange={(value: number) => props.changeItemsAppearance(selectedDiagramId, [selectedShape], c.name, value)} />
                    }
                    {c instanceof SelectionConfigurable &&
                        <SelectPicker
                            className='menu-item'
                            value={selectedShape.appearance.get(c.name)}
                            sufix={c.sufix}
                            options={c.options}
                            onChange={(value: string) => props.changeItemsAppearance(selectedDiagramId, [selectedShape], c.name, value)} />
                    }
                    {c instanceof ColorConfigurable &&
                        <ColorPicker
                            className='menu-item'
                            popoverPlacement='bottom'
                            activeColorTab={selectedColorTab}
                            value={selectedShape.appearance.get(c.name)}
                            onChange={value => props.changeItemsAppearance(selectedDiagramId, [selectedShape], c.name, value.toNumber())}
                            onActiveColorTabChanged={key => props.selectColorTab(key)} />
                    }
                </Tooltip>
            )}
        </>
    ) : null;
};

const mapStateToProps = (state: EditorStateInStore & UIStateInStore) => {
    return {
        selectedDiagramId: getDiagramId(state),
        selectedShape: getSelectedShape(state),
        selectedConfigurables: getSelectedConfigurables(state),
        selectedColorTab: state.ui.selectedColorTab
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    changeItemsAppearance, selectColorTab
}, dispatch);

export const CustomPropertiesMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomPropertiesMenu);
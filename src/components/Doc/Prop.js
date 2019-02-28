import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Anchor, Heading, Markdown, Text } from 'grommet';
import { Link as LinkIcon } from 'grommet-icons';
import { Syntax } from './Syntax';
import { Value } from './Value';

// parseFormat() parses the react-desc property format string into
// an object that makes it easier for us to style the content.
const parseFormat = format => {
  const lines = format.split(/\n/);
  const working = [{ values: [] }];
  lines.forEach(line => {
    if (line.indexOf('{') !== -1) {
      working.unshift({ type: 'object', values: [] });
    } else if (line.indexOf('}') !== -1) {
      while (working[0].type !== 'object') {
        const value = working.shift();
        working[0].values.push(value);
      }
      const value = working.shift();
      working[0].values.push(value);
    } else if (line.indexOf('[') !== -1 && line.indexOf(']') !== -1) {
      working[0].values.push({
        type: 'array',
        values: [line.slice(1, line.length - 1)],
      });
    } else if (line.indexOf('[') !== -1) {
      working.unshift({ type: 'array', values: [] });
    } else if (line.indexOf(']') !== -1) {
      while (working[0].type !== 'array') {
        const value = working.shift();
        working[0].values.push(value);
      }
      const value = working.shift();
      working[0].values.push(value);
    } else if (line.indexOf(':') !== -1 && line.indexOf(',') !== -1) {
      const parts = line.split(':');
      working[0].values.push({
        type: 'property',
        name: `${parts[0]}:`,
        values: [parts[1]],
      });
    } else if (line.indexOf(':') !== -1) {
      working.unshift({ type: 'property', name: line, values: [] });
    } else if (line.indexOf(',') !== -1) {
      working[0].values.push(line);
      const value = working.shift();
      working[0].values.push(value);
    } else {
      working[0].values.push(line);
    }
  });
  return working.shift();
};

export class Prop extends Component {
  state = {};

  render() {
    const { property, syntax, first } = this.props;
    const { over } = this.state;
    return (
      <Box
        id={property.name}
        border="bottom"
        gap="small"
        pad={{ top: !first ? 'medium' : undefined, bottom: 'medium' }}
        onMouseOver={() => this.setState({ over: true })}
        onMouseOut={() => this.setState({ over: false })}
        onFocus={() => this.setState({ over: true })}
        onBlur={() => this.setState({ over: false })}
      >
        <Box direction="row" justify="between" align="center">
          <Heading level={3} margin="none">
            {property.name}
          </Heading>
          <Anchor
            href={`#${property.name}`}
            icon={<LinkIcon color={over ? 'light-4' : 'white'} />}
          />
        </Box>
        <Box direction="row-responsive" justify="between" align="start">
          <Box basis="1/2" margin={{ right: 'large', bottom: 'medium' }}>
            <Markdown>
              {property.description.replace('<', '&lt;').replace('>', '&gt;')}
            </Markdown>
          </Box>
          <Box flex align="start" margin={{ bottom: 'medium' }}>
            <Text color="neutral-1">
              {(syntax && (
                <Syntax
                  syntax={syntax}
                  format={property.format}
                  defaultValue={property.defaultValue}
                />
              )) ||
                property.type || (
                  <Value
                    value={parseFormat(property.format)}
                    defaultValue={property.defaultValue}
                  />
                )}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }
}

Prop.propTypes = {
  property: PropTypes.shape({}).isRequired,
  syntax: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  first: PropTypes.bool.isRequired,
};

Prop.defaultProps = {
  syntax: undefined,
};

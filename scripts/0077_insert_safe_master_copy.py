import binascii
from django.db import migrations

def ethereum_address_to_binary(address):
    # Remove the '0x' prefix from the address if it exists
    if address.startswith('0x'):
        address = address[2:]

    # Convert the hexadecimal string to binary representation
    binary_representation = binascii.unhexlify(address)

    return binary_representation

def insert_initial_values(apps, schema_editor):
    SafeL2MasterCopy = apps.get_model('history', 'SafeMasterCopy')

    initial_values = [
        {
            'address': ethereum_address_to_binary('0xC44951780f195Ed71145e3d0d2F25726A097C348'),
            'initial_block_number': 0,
            'tx_block_number': None,
            'version': '1.3.0',
            'l2': True,
            'deployer': 'Gnosis',
        },
        # Add more initial values as needed
    ]

    for data in initial_values:
        SafeL2MasterCopy.objects.create(**data)

class Migration(migrations.Migration):
    dependencies = [
        ("history", "0076_alter_safemastercopy_deployer"),
    ]

    operations = [
        migrations.RunPython(insert_initial_values),
    ]

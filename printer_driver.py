import serial

ser = serial.Serial(
    '/dev/ttyS0', 
    9600, 
    timeout=1,
    stopbits=serial.STOPBITS_ONE,
    parity=serial.PARITY_NONE,)

# 0000 = Status Request
# 0001 = Command Request

# 080 = OK, no ticket in the reader
# 0<0 = OK, ticket in the reader
# 030 = OK, ticket au milieu
# 050 = OK, but it fucking sucks

def parse_cttm_response(data: bytes):
    # Get index of STX and ETX
    stx = data.find(b'\x02')
    etx = data.find(b'\x03')

    # If STX and ETX are found, return the data between them
    if stx != -1 and etx != -1:
        return data[stx+1:etx]
    
    return None

def send_command(command: str):
    ser.write(b'\x02' + command.encode() + b'\x03')

def create_text_frame(reverse_color: bool, char_width: int, char_height: int, start_position: int, nb_lignes: int):
    return f"75{int(reverse_color)}{char_width}{char_height}71{str(start_position * char_height * 0x10).zfill(3)}6{str(nb_lignes).zfill(3)}"

def write_op(text: str, reverse_color: bool, char_width: int, char_height: int, start_position: int, nb_lignes: int, x: int, y: int):
    if nb_lignes == 1:
        raise Exception("nb_lignes must be greater than 1")
    
    text_frame = create_text_frame(reverse_color, char_width, char_height, start_position, nb_lignes)
    header = f"1{x}{y}{0}0{chr(0x30)}{chr(0x31)}"

    return f"{header}{text_frame}{text}"


send_command('0000')
print(parse_cttm_response(ser.read(100)))

send_command('000:')
print(parse_cttm_response(ser.read(100)))

# Y = 8 au milieu
# Y = 5 tombe
# Y = 4 reste au fond
# Y = 1 Rend

# 1110001 75 0 2 2 71 000 6 002 Exemple
# 1110001 75 0 2 2 71 000 6 002 Test

command = write_op('Test', False, char_width=2, char_height=2, start_position=0, nb_lignes=2, x=1, y=1)
print(command)
send_command(command)
print(ser.read(100))